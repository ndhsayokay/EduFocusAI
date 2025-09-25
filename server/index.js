require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// === 1. IMPORT CÁC MODULE CẦN THIẾT CHO SOCKET.IO ===
const http = require('http');
const { Server } = require("socket.io");
// ======================================================

const app = express();

// === 2. TẠO HTTP SERVER VÀ GẮN SOCKET.IO VÀO ===
const server = http.createServer(app);
const io = new Server(server, {
  // Cấu hình CORS để cho phép client (localhost:3000) kết nối
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
// =================================================

// Kết nối với MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Kết nối MongoDB thành công!');
  } catch (error) {
    console.error('Kết nối MongoDB thất bại:', error.message);
    process.exit(1);
  }
};
connectDB();

// Middlewares
app.use(cors()); 
app.use(express.json()); 

// Định nghĩa các Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/study-rooms', require('./routes/studyRooms'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/users', require('./routes/users'));
app.use('/api/friends', require('./routes/friends'));
app.use('/api/calendar', require('./routes/calendar'));

app.get('/', (req, res) => {
  res.send('Server API đang hoạt động!');
});

// === 3. GỌI FILE LOGIC CỦA SOCKET.IO ===
// Chúng ta truyền đối tượng 'io' đã được khởi tạo vào file này
require('./socket')(io);
// ========================================

const PORT = process.env.PORT || 5000;

// === 4. DÙNG server.listen THAY VÌ app.listen ===
server.listen(PORT, () => {
  console.log(`Server đang chạy tại cổng ${PORT}`);
});
// ===============================================