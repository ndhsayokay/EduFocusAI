const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/users/search
// @desc    Tìm kiếm người dùng theo email
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const searchQuery = req.query.q;
    if (!searchQuery) {
      return res.status(400).json({ msg: 'Vui lòng nhập email để tìm kiếm' });
    }
    
    // Tìm người dùng có email chứa chuỗi tìm kiếm, không phân biệt hoa thường
    // Loại trừ chính người dùng đang tìm kiếm khỏi kết quả
    const users = await User.find({
      email: { $regex: searchQuery, $options: 'i' },
      _id: { $ne: req.user.id }
    }).select('-password'); 

    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;