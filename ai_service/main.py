import os
import cv2
import numpy as np
import mediapipe as mp
import tensorflow as tf
import math
from fastapi import FastAPI, File, UploadFile, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import shutil
import tempfile

# Import function in file ml_utils
from ml_utils import preprocess_image, build_eye_model

# Initialize the tool
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    max_num_faces=1, 
    refine_landmarks=True, 
    min_detection_confidence=0.5, 
    min_tracking_confidence=0.5
)

app = FastAPI()

# CORS CONFIGURATION
origins = [
    "http://localhost:3000",  # Address of React application
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# FALLBACK
def calculate_ear(eye_landmarks):
    # Get coordinates of points according to the standard 6-point diagram
    p1 = eye_landmarks[0]
    p2 = eye_landmarks[1]
    p3 = eye_landmarks[2]
    p4 = eye_landmarks[3]
    p5 = eye_landmarks[4]
    p6 = eye_landmarks[5]

    # Calculate vertical distance
    vertical_dist1 = math.dist((p2.x, p2.y), (p6.x, p6.y))
    vertical_dist2 = math.dist((p3.x, p3.y), (p5.x, p5.y))
    
    # Calculate horizontal distance
    horizontal_dist = math.dist((p1.x, p1.y), (p4.x, p4.y))
    
    if horizontal_dist == 0: return 0
    
    # Standard EAR formula
    ear = (vertical_dist1 + vertical_dist2) / (2.0 * horizontal_dist)
    return ear

def calculate_mar(mouth_landmarks, image_shape):
    # Chỉ số cho miệng: [13, 14, 78, 308]
    p1 = mouth_landmarks[13]
    p2 = mouth_landmarks[14]
    p3 = mouth_landmarks[78]
    p4 = mouth_landmarks[308]
    vertical_dist = math.dist((p1.x, p1.y), (p2.x, p2.y))
    horizontal_dist = math.dist((p3.x, p3.y), (p4.x, p4.y))
    if horizontal_dist == 0: return 0
    return vertical_dist / horizontal_dist

# USER ID AUTHENTICATION
def get_current_user_id(user_id: str = Form(...)):
    if not user_id or len(user_id) < 1:
        raise HTTPException(status_code=400, detail="User ID không hợp lệ")
    return user_id

# CACHE CHO MÔ HÌNH 
model_cache = {}

def load_model(user_id: str):
    model_path = f"models/{user_id}_eye_model.h5"
    if user_id in model_cache:
        return model_cache[user_id]
    if os.path.exists(model_path):
        model = tf.keras.models.load_model(model_path)
        model_cache[user_id] = model
        return model
    return None

# EYE CUTTING JAWS FROM FACE PHOTOS
def extract_eye(image, face_landmarks, eye_indices, padding=10):
    h, w = image.shape[:2]
    x_coords = [face_landmarks.landmark[i].x * w for i in eye_indices]
    y_coords = [face_landmarks.landmark[i].y * h for i in eye_indices]
    x_min, x_max = int(min(x_coords)), int(max(x_coords))
    y_min, y_max = int(min(y_coords)), int(max(y_coords))
    # padding
    x_min = max(0, x_min - padding)
    x_max = min(w, x_max + padding)
    y_min = max(0, y_min - padding)
    y_max = min(h, y_max + padding)
    eye_crop = image[y_min:y_max, x_min:x_max]
    return eye_crop

# API 1: HIỆU CHỈNH CÁ NHÂN HÓA (/calibrate) 
@app.post("/calibrate")
async def calibrate_user_model(
    open_eyes_files: List[UploadFile] = File(...),
    closed_eyes_files: List[UploadFile] = File(...),
    user_id: str = Depends(get_current_user_id)
):
    all_images = []
    all_labels = []

    with tempfile.TemporaryDirectory() as temp_dir:
        # Xử lý ảnh mắt mở
        for file in open_eyes_files:
            # Lưu file tạm
            temp_file = os.path.join(temp_dir, file.filename)
            with open(temp_file, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            # Đọc ảnh
            img = cv2.imread(temp_file)
            if img is None:
                continue

            # Chuyển đổi ảnh sang RGB để dùng MediaPipe
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            results = face_mesh.process(img_rgb)
            if results.multi_face_landmarks:
                face_landmarks = results.multi_face_landmarks[0]
                # Cắt mắt trái và mắt phải
                left_eye_indices = [33, 160, 158, 133, 153, 144]
                right_eye_indices = [362, 385, 387, 263, 373, 380]
                left_eye = extract_eye(img, face_landmarks, left_eye_indices)
                right_eye = extract_eye(img, face_landmarks, right_eye_indices)
                if left_eye.size > 0:
                    all_images.append(left_eye)
                    all_labels.append(1.0)
                if right_eye.size > 0:
                    all_images.append(right_eye)
                    all_labels.append(1.0)

        # Xử lý ảnh mắt nhắm
        for file in closed_eyes_files:
            temp_file = os.path.join(temp_dir, file.filename)
            with open(temp_file, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            img = cv2.imread(temp_file)
            if img is None:
                continue

            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            results = face_mesh.process(img_rgb)
            if results.multi_face_landmarks:
                face_landmarks = results.multi_face_landmarks[0]
                left_eye_indices = [33, 160, 158, 133, 153, 144]
                right_eye_indices = [362, 385, 387, 263, 373, 380]
                left_eye = extract_eye(img, face_landmarks, left_eye_indices)
                right_eye = extract_eye(img, face_landmarks, right_eye_indices)
                if left_eye.size > 0:
                    all_images.append(left_eye)
                    all_labels.append(0.0)
                if right_eye.size > 0:
                    all_images.append(right_eye)
                    all_labels.append(0.0)

    if len(all_images) == 0:
        raise HTTPException(status_code=400, detail="Không thể trích xuất mắt từ ảnh. Vui lòng thử lại với ảnh khác.")

    # Tiền xử lý dữ liệu
    processed_images = [preprocess_image(img) for img in all_images]
    
    X_train = np.vstack(processed_images)
    y_train = np.array(all_labels)

    # Xây dựng và huấn luyện mô hình
    model = build_eye_model()
    model.fit(X_train, y_train, epochs=15, batch_size=4, validation_split=0.2, verbose=0)
    
    # Lưu mô hình đã được cá nhân hóa
    if not os.path.exists('models'):
        os.makedirs('models')
    model_path = f"models/{user_id}_eye_model.h5"
    model.save(model_path)
    # Cập nhật cache
    model_cache[user_id] = model

    return {"message": f"Hiệu chỉnh thành công cho người dùng {user_id}", "number_of_samples": len(all_images)}

# API 2: PHÂN TÍCH SỰ TẬP TRUNG (/analyze) 
@app.post("/analyze")
async def analyze_image(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id)
):
    # Đọc ảnh
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Lật ảnh và chuyển màu để xử lý
    image_bgr = cv2.flip(image_bgr, 1)
    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    img_h, img_w, _ = image_bgr.shape

    # Chạy MediaPipe
    results = face_mesh.process(image_rgb)
    if not results.multi_face_landmarks:
        return {"focus_score": 0, "status": "Không tìm thấy khuôn mặt"}
    
    face_landmarks = results.multi_face_landmarks[0]

    # LUỒNG 1: SỬ DỤNG DEEP LEARNING NẾU ĐÃ HIỆU CHỈNH 
    model = load_model(user_id)
    if model is not None:
        try:
            # Trích xuất cả hai mắt
            left_eye_indices = [33, 160, 158, 133, 153, 144]
            right_eye_indices = [362, 385, 387, 263, 373, 380]
            left_eye = extract_eye(image_bgr, face_landmarks, left_eye_indices)
            right_eye = extract_eye(image_bgr, face_landmarks, right_eye_indices)

            if left_eye.size == 0 or right_eye.size == 0:
                return {"focus_score": 50, "status": "Không thấy rõ mắt"}

            # Tiền xử lý và dự đoán
            processed_left_eye = preprocess_image(left_eye)
            processed_right_eye = preprocess_image(right_eye)
            left_score = model.predict(processed_left_eye, verbose=0)[0][0]
            right_score = model.predict(processed_right_eye, verbose=0)[0][0]
            eye_openness_score = (left_score + right_score) / 2.0

            focus_score = int(eye_openness_score * 100)
            status = "Tập trung (AI)" if focus_score > 60 else "Mất tập trung (AI)"
            
            return {"focus_score": focus_score, "status": status, "eye_score": float(eye_openness_score)}
        except Exception as e:
            print(f"Lỗi khi dùng mô hình DL: {e}")
            # Nếu có lỗi, quay về dùng thuật toán hình học
            pass

    # LUỒNG 2: FALLBACK - SỬ DỤNG THUẬT TOÁN HÌNH HỌC 
    base_score = 100
    status_text = "Tập trung"
    debug_info = {}

    # Các chỉ số này tương ứng với sơ đồ 6 điểm cho mỗi mắt
    left_eye_indices = [362, 385, 387, 263, 373, 380]
    right_eye_indices = [33, 160, 158, 133, 153, 144]
    
    all_landmarks = face_landmarks.landmark
    left_eye_landmarks = [all_landmarks[i] for i in left_eye_indices]
    right_eye_landmarks = [all_landmarks[i] for i in right_eye_indices]

    left_ear = calculate_ear(left_eye_landmarks)
    right_ear = calculate_ear(right_eye_landmarks)
    avg_ear = (left_ear + right_ear) / 2.0
    
    debug_info['avg_ear'] = round(avg_ear, 2)
    if avg_ear < 0.2:
        base_score -= 50
        status_text = "Buồn ngủ"

    # Phân tích ngáp (MAR)
    mar = calculate_mar(face_landmarks.landmark, (img_h, img_w))
    debug_info['mar'] = round(mar, 2)
    if mar > 0.6:
        base_score -= 60
        status_text = "Đang ngáp"
        
    # Mô hình 3D khuôn mặt chuẩn hóa
    model_points = np.array([
        (0.0, 0.0, 0.0),             # Chóp mũi
        (0.0, -330.0, -65.0),        # Cằm
        (-225.0, 170.0, -135.0),     # Khóe mắt trái
        (225.0, 170.0, -135.0),      # Khóe mắt phải
        (-150.0, -150.0, -125.0),    # Khóe miệng trái
        (150.0, -150.0, -125.0)      # Khóe miệng phải
    ])
    
    # Lấy các điểm 2D tương ứng từ ảnh
    image_points = np.array([
        (all_landmarks[1].x * img_w, all_landmarks[1].y * img_h),     # Chóp mũi
        (all_landmarks[199].x * img_w, all_landmarks[199].y * img_h),   # Cằm
        (all_landmarks[33].x * img_w, all_landmarks[33].y * img_h),      # Khóe mắt trái
        (all_landmarks[263].x * img_w, all_landmarks[263].y * img_h),    # Khóe mắt phải
        (all_landmarks[61].x * img_w, all_landmarks[61].y * img_h),      # Khóe miệng trái
        (all_landmarks[291].x * img_w, all_landmarks[291].y * img_h)     # Khóe miệng phải
    ], dtype="double")
    
    # Cài đặt Camera
    focal_length = img_w
    center = (img_w/2, img_h/2)
    camera_matrix = np.array(
        [[focal_length, 0, center[0]],
         [0, focal_length, center[1]],
         [0, 0, 1]], dtype = "double"
    )
    dist_coeffs = np.zeros((4,1)) # Giả sử không có méo ống kính

    # Giải thuật toán PnP
    (success, rotation_vector, translation_vector) = cv2.solvePnP(model_points, image_points, camera_matrix, dist_coeffs, flags=cv2.SOLVEPNP_ITERATIVE)

    if success:
        # Chiếu một điểm 3D ở "phía trước" mũi lên ảnh 2D
        # Điểm này cách mũi 1000 đơn vị dọc theo trục Z
        (nose_end_point2D, _) = cv2.projectPoints(np.array([(0.0, 0.0, 1000.0)]), rotation_vector, translation_vector, camera_matrix, dist_coeffs)
        
        # Lấy tọa độ điểm chóp mũi trên ảnh 2D
        nose_tip_2d = image_points[0]

        # Tính toán độ lệch so với trung tâm
        # Độ lệch ngang (x_offset)
        x_offset = nose_end_point2D[0][0][0] - nose_tip_2d[0]
        # Độ lệch dọc (y_offset)
        y_offset = nose_end_point2D[0][0][1] - nose_tip_2d[1]
        
        debug_info['x_offset (nhìn ngang)'] = round(x_offset, 1)
        debug_info['y_offset (nhìn xuống)'] = round(y_offset, 1)

        # Áp dụng điểm phạt dựa trên độ lệch (offset)
        # Các ngưỡng này tính bằng pixel, có thể cần tinh chỉnh
        X_THRESHOLD = 80
        Y_THRESHOLD = 80

        if x_offset < -X_THRESHOLD:
            base_score -= (abs(x_offset) - X_THRESHOLD) * 0.6 
            status_text = "Nhìn sang trái"
        elif x_offset > X_THRESHOLD:
            base_score -= (x_offset - X_THRESHOLD) * 0.6
            status_text = "Nhìn sang phải"
        
        if y_offset > Y_THRESHOLD:
            base_score -= (y_offset - Y_THRESHOLD) * 0.35 
            status_text = "Nhìn xuống"
        elif y_offset < -Y_THRESHOLD:
            base_score -= (abs(y_offset) - Y_THRESHOLD) * 0.6
            status_text = "Nhìn lên"
    else:
        debug_info['head_pose'] = 'failed'

    final_score = max(0, min(100, int(base_score)))
    
    print(f"User: {user_id} | Score: {final_score} | Status: {status_text} | Debug: {debug_info}")
    
    return {"focus_score": final_score, "status": f"{status_text} (Cơ bản)"}