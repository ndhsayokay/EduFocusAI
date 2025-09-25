import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
import cv2
import numpy as np

IMG_SIZE = 64 # Kích thước ảnh mắt/miệng sau khi xử lý

def preprocess_image(image_arr):
    """
    Hàm này nhận một mảng numpy của ảnh,
    chuyển thành ảnh xám, resize, cân bằng histogram và chuẩn hóa.
    """
    gray = cv2.cvtColor(image_arr, cv2.COLOR_BGR2GRAY)
    # Cân bằng histogram để cải thiện độ tương phản
    gray = cv2.equalizeHist(gray)
    resized = cv2.resize(gray, (IMG_SIZE, IMG_SIZE))
    normalized = resized / 255.0 # Chuẩn hóa pixel về khoảng 0-1
    # Thêm một chiều để phù hợp với input của model CNN
    return normalized.reshape(-1, IMG_SIZE, IMG_SIZE, 1)

def build_eye_model():
    """
    Xây dựng kiến trúc mô hình CNN để học trạng thái mở/nhắm của mắt.
    Đây là một bài toán Hồi quy (Regression).
    """
    model = Sequential([
        Conv2D(32, (3, 3), activation='relu', input_shape=(IMG_SIZE, IMG_SIZE, 1)),
        MaxPooling2D((2, 2)),
        
        Conv2D(64, (3, 3), activation='relu'),
        MaxPooling2D((2, 2)),

        Conv2D(128, (3, 3), activation='relu'),
        MaxPooling2D((2, 2)),

        Flatten(),
        Dense(128, activation='relu'),
        Dropout(0.5),
        Dense(64, activation='relu'),
        Dropout(0.3),
        # Lớp output có 1 neuron và dùng 'sigmoid' để cho ra kết quả từ 0 (nhắm) đến 1 (mở)
        Dense(1, activation='sigmoid') 
    ])
    
    # Biên dịch mô hình
    model.compile(optimizer='adam',
                  loss='mean_squared_error', # Loss function phù hợp cho Hồi quy
                  metrics=['mae']) # Mean Absolute Error
                  
    return model