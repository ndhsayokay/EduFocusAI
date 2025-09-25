# 🚀 FocusFlow AI: Smart Study Companion

**FocusFlow AI** is a modern full-stack web application designed to optimize online learning. It helps you stay focused, receive real-time feedback, and create a collaborative study environment. By combining **computer vision** and **deep learning**, FocusFlow AI delivers a personalized, efficient, and engaging learning experience.

---

## ✨ Key Features

- **🧠 AI Focus Tracking:** Analyze head pose, eye state (EAR), and yawn detection (MAR) through your webcam to generate a real-time Focus Score.  
- **🤖 Personalized AI Model (In Development):** Calibrate and train a model tailored to your facial features for enhanced accuracy.  
- **🎯 Gamification:** Stay motivated with XP, levels, and a virtual pet that thrives based on your focus.  
- **✅ Advanced To-Do List:** Manage detailed tasks with deadlines, priorities, descriptions, and subtasks.  
- **📅 Calendar Integration:** Automatically visualize deadlines on a clean interactive calendar.  
- **📊 Performance Analytics:** Track your study habits and progress with dashboards and visual reports.  
- **🤝 Community Features:**
  - Virtual Study Rooms to learn with others.  
  - Real-time Chat for instant communication.  
  - Friends system with requests and online status.  
  - Weekly and monthly Leaderboards.  

---

## 🛠️ Tech Stack

- **Frontend:** React (Hooks & Context API)  
- **Backend API:** Node.js, Express.js  
- **AI Service:** Python (FastAPI)  
- **Database:** MongoDB (Mongoose)  
- **Realtime:** Socket.IO  
- **AI & Computer Vision:** TensorFlow/Keras, MediaPipe, OpenCV  
- **Authentication:** JWT (JSON Web Tokens)  

---

## ⚡ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) ≥16  
- [Python](https://www.python.org/) ≥3.9  
- [MongoDB](https://www.mongodb.com/try/download/community) (local) or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)  

### Installation

1. **Clone the repo:**
   ```bash
   git clone https://github.com/ndhsayokay/EduFocusAI
   cd focusflow-ai
   ```

2. **Setup backend (Node.js API):**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in `server`:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```

3. **Setup AI service (Python):**
   ```bash
   cd ../ai_service
   python -m venv venv
   ```
   Activate venv:  
   - Windows: `venv\Scripts\activate`  
   - macOS/Linux: `source venv/bin/activate`  

   Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   *(If missing `requirements.txt`, run: `pip install fastapi "uvicorn[standard]" opencv-python mediapipe numpy tensorflow scikit-learn python-multipart`)*  

4. **Setup frontend (React):**
   ```bash
   cd ../client
   npm install
   ```

---

## ▶️ Running the App

Open **3 terminals**:

1. **Backend server (Node.js):**
   ```bash
   cd server
   node index.js
   ```
   👉 Available at `http://localhost:5000`

2. **AI service (FastAPI):**
   ```bash
   cd ai_service
   venv\Scripts\activate  # or source venv/bin/activate
   python -m uvicorn main:app --reload
   ```
   👉 Available at `http://localhost:8000`

3. **Frontend (React):**
   ```bash
   cd client
   npm start
   ```
   👉 Opens in browser at `http://localhost:3000`

---

## 📖 API Endpoints

- **Auth:** `/api/auth/register`, `/api/auth/login`, `/api/auth/me`  
- **Tasks:** `GET, POST, PUT, DELETE /api/tasks`  
- **Study Sessions:** `POST /api/sessions`  
- **Study Rooms:** `GET, POST, /:id, /:id/join`  
- **Friends:** `/api/friends` (search, request, accept, etc.)  
- **AI Service:** `POST /analyze`, `POST /calibrate` (`http://localhost:8000`)  

---

## 📧 Contact
👤 Nguyen Duc Hieu – hangnguyen16052001@gmail.com  
🔗 Repo: [https://github.com/ndhsayokay/EduFocusAI]
