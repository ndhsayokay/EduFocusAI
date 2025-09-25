const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const StudySession = require('../models/StudySession');
const Task = require('../models/Task');

// === 1. API LẤY DỮ LIỆU TỔNG HỢP ===
// @route   GET /api/reports/summary
// @desc    Lấy các số liệu tổng hợp của người dùng
// @access  Private
router.get('/summary', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Lấy tất cả các phiên học của user
    const sessions = await StudySession.find({ userId });

    // --- Tính tổng thời gian học ---
    const totalDurationSeconds = sessions.reduce((acc, session) => {
      const duration = (new Date(session.endTime) - new Date(session.startTime)) / 1000;
      return acc + duration;
    }, 0);
    const totalHours = totalDurationSeconds / 3600;

    // --- Tính điểm tập trung trung bình ---
    let totalFocusSum = 0;
    let totalFocusCount = 0;
    sessions.forEach(session => {
      if (session.focusData && session.focusData.length > 0) {
        totalFocusSum += session.focusData.reduce((acc, data) => acc + data.score, 0);
        totalFocusCount += session.focusData.length;
      }
    });
    const averageFocus = totalFocusCount > 0 ? totalFocusSum / totalFocusCount : 0;

    // --- Đếm số task đã hoàn thành ---
    const completedTasksCount = await Task.countDocuments({ userId, status: 'completed' });
    
    // Trả về kết quả
    res.json({
      totalSessions: sessions.length,
      totalHoursStudied: parseFloat(totalHours.toFixed(2)),
      overallAverageFocus: parseFloat(averageFocus.toFixed(2)),
      completedTasks: completedTasksCount
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// === 2. API LẤY LỊCH SỬ HỌC TẬP CHO BIỂU ĐỒ ===
// @route   GET /api/reports/history
// @desc    Lấy dữ liệu lịch sử các phiên học
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const sessions = await StudySession.find({ userId: req.user.id }).sort({ startTime: 1 }); // Sắp xếp từ cũ đến mới

    if (!sessions || sessions.length === 0) {
        return res.json([]);
    }

    // Xử lý dữ liệu để phù hợp cho biểu đồ
    const historyData = sessions.map(session => {
        const durationMinutes = (new Date(session.endTime) - new Date(session.startTime)) / 1000 / 60;
        
        let averageFocus = 0;
        if (session.focusData && session.focusData.length > 0) {
            const totalFocusScore = session.focusData.reduce((acc, data) => acc + data.score, 0);
            averageFocus = totalFocusScore / session.focusData.length;
        }

        return {
            date: new Date(session.startTime).toLocaleDateString('vi-VN'), // Định dạng ngày tháng kiểu Việt Nam
            duration: parseFloat(durationMinutes.toFixed(2)),
            averageFocus: parseFloat(averageFocus.toFixed(2))
        };
    });

    res.json(historyData);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;