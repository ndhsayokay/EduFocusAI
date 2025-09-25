const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Import middleware xác thực
const StudySession = require('../models/StudySession'); // Import model
const User = require('../models/User');

// @route   POST api/sessions
// @desc    Lưu một phiên học mới
// @access  Private

console.log('>>> File routes/sessions.js đã được nạp!'); 
router.post('/', auth, async (req, res) => {
  // Lấy dữ liệu từ body của request
  const { startTime, endTime, focusData } = req.body;

  try {
    // Tạo một phiên học mới từ model
    const newSession = new StudySession({
      userId: req.user.id, // Lấy userId từ middleware 'auth'
      startTime,
      endTime,
      focusData,
    });

    // Lưu vào database
    const session = await newSession.save();
    // === BẮT ĐẦU LOGIC GAMIFICATION ===
    // 1. Tìm người dùng trong database
    const user = await User.findById(req.user.id);
    if (!user) {
      // Trường hợp hiếm gặp nhưng vẫn nên kiểm tra
      return res.status(404).json({ msg: 'Không tìm thấy người dùng' });
    }

    // 2. Tính toán XP kiếm được
    // 2.1. Tính thời gian học (tính bằng phút)
    const durationInMinutes = (new Date(endTime) - new Date(startTime)) / 1000 / 60;

    // 2.2. Tính điểm tập trung trung bình
    let averageFocus = 0;
    if (focusData && focusData.length > 0) {
      const totalFocusScore = focusData.reduce((acc, current) => acc + current.score, 0);
      averageFocus = totalFocusScore / focusData.length;
    }

    // 2.3. Áp dụng công thức tính XP (bạn có thể điều chỉnh các hệ số này)
    // Ví dụ: 1 phút học được 2 XP, 1 điểm focus trung bình được 0.5 XP
    const xpEarned = Math.round((durationInMinutes * 2) + (averageFocus * 0.5));

    if (averageFocus >= 80) {
      // Tập trung cao, tăng sức khỏe
      user.gamification.virtualPet.health = Math.min(100, user.gamification.virtualPet.health + 10);
    } else if (averageFocus < 50) {
      // Tập trung thấp, giảm sức khỏe
      user.gamification.virtualPet.health = Math.max(0, user.gamification.virtualPet.health - 15);
    }

    // Cập nhật trạng thái dựa trên sức khỏe
    const petHealth = user.gamification.virtualPet.health;
    if (petHealth > 70) {
      user.gamification.virtualPet.status = 'happy';
    } else if (petHealth <= 30) {
      user.gamification.virtualPet.status = 'sad';
    } else {
      user.gamification.virtualPet.status = 'neutral';
    }
    
    // 3. Cộng XP và kiểm tra Level-up
    user.gamification.xp += xpEarned;

    // Vòng lặp while để xử lý trường hợp lên nhiều cấp một lúc
    while (user.gamification.xp >= user.gamification.xpToNextLevel) {
      user.gamification.level += 1;
      // Trừ đi lượng XP yêu cầu của cấp cũ, giữ lại XP dư
      user.gamification.xp -= user.gamification.xpToNextLevel; 
      // Tăng ngưỡng XP cho cấp độ tiếp theo (ví dụ: tăng 50%)
      user.gamification.xpToNextLevel = Math.round(user.gamification.xpToNextLevel * 1.5);
    }
    
    // 4. Lưu lại thông tin người dùng đã được cập nhật
    await user.save();
    // === KẾT THÚC LOGIC GAMIFICATION ===

    res.status(201).json({ session, xpEarned }); 
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;