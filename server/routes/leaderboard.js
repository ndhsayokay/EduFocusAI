const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const StudySession = require('../models/StudySession');
const { startOfWeek, startOfMonth, endOfDay } = require('date-fns'); // Import các hàm xử lý ngày

// @route   GET /api/leaderboard
// @desc    Lấy dữ liệu bảng xếp hạng
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Lấy query param 'period' từ URL, mặc định là 'weekly'
    const period = req.query.period || 'weekly';
    const limit = parseInt(req.query.limit) || 20; // Lấy top 20, có thể tùy chỉnh

    let startDate;
    const now = new Date();

    // Xác định ngày bắt đầu dựa trên 'period'
    if (period === 'monthly') {
      startDate = startOfMonth(now);
    } else { 
      // 'weekStartsOn: 1' để coi Thứ Hai là ngày đầu tuần
      startDate = startOfWeek(now, { weekStartsOn: 1 });
    }

    const leaderboardData = await StudySession.aggregate([
      // Giai đoạn 1: $match - Lọc các session trong khoảng thời gian hợp lệ
      {
        $match: {
          startTime: { $gte: startDate, $lte: endOfDay(now) },
          endTime: { $exists: true } // Chỉ tính các session đã kết thúc
        }
      },
      
      // Giai đoạn 2: $project - Tính toán thời gian của mỗi session
      {
        $project: {
          userId: 1, 
          durationInSeconds: {
            $divide: [
              { $subtract: ["$endTime", "$startTime"] }, 
              1000
            ]
          }
        }
      },

      // Giai đoạn 3: $group - Nhóm theo userId và tính tổng thời gian học
      {
        $group: {
          _id: "$userId", 
          totalDuration: { $sum: "$durationInSeconds" } 
        }
      },

      // Giai đoạn 4: $sort - Sắp xếp theo tổng thời gian giảm dần
      {
        $sort: {
          totalDuration: -1 // -1 là giảm dần
        }
      },

      // Giai đoạn 5: $limit - Chỉ lấy top N kết quả
      {
        $limit: limit
      },

      // Giai đoạn 6: $lookup - "Join" với collection 'users' để lấy thông tin người dùng
      {
        $lookup: {
          from: "users", // Tên collection trong MongoDB (thường là số nhiều)
          localField: "_id", // Trường trong kết quả hiện tại (là userId)
          foreignField: "_id", // Trường trong collection 'users'
          as: "userDetails" // Tên mảng chứa kết quả join
        }
      },

      // Giai đoạn 7: $unwind - "Phá" mảng userDetails (vì mỗi user chỉ có 1 kết quả)
      {
        $unwind: "$userDetails"
      },

      // Giai đoạn 8: $project - Chọn lọc và định dạng lại kết quả cuối cùng
      {
        $project: {
          _id: 0, 
          userId: "$_id",
          email: "$userDetails.email",
          totalHours: { $divide: ["$totalDuration", 3600] } 
        }
      }
    ]);
    
    res.json(leaderboardData);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;