const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const StudyRoom = require('../models/StudyRoom');
const User = require('../models/User'); // Cần để populate thông tin

// === 1. TẠO MỘT PHÒNG HỌC MỚI ===
// @route   POST /api/study-rooms
// @desc    Tạo một phòng học mới
// @access  Private
router.post('/', auth, async (req, res) => {
  const { name, description, isPublic } = req.body;
  
  try {
    const newRoom = new StudyRoom({
      name,
      description,
      isPublic,
      owner: req.user.id,
      members: [req.user.id], 
    });

    const room = await newRoom.save();
    res.status(201).json(room);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// === 2. LẤY DANH SÁCH CÁC PHÒNG HỌC CÔNG KHAI ===
// @route   GET /api/study-rooms
// @desc    Lấy danh sách các phòng công khai
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const rooms = await StudyRoom.find({ isPublic: true })
                                 .populate('owner', ['email']) 
                                 .sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// === 3. LẤY THÔNG TIN CHI TIẾT CỦA MỘT PHÒNG HỌC ===
// @route   GET /api/study-rooms/:id
// @desc    Lấy thông tin chi tiết một phòng
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    // .populate() là một tính năng mạnh mẽ của Mongoose
    // Nó sẽ lấy thông tin chi tiết của owner và members (chỉ lấy trường email)
    // thay vì chỉ trả về ID
    const room = await StudyRoom.findById(req.params.id)
      .populate('owner', ['email'])
      .populate('members', ['email']);

    if (!room) {
      return res.status(404).json({ msg: 'Không tìm thấy phòng học' });
    }
    res.json(room);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// === 4. THAM GIA MỘT PHÒNG HỌC ===
// @route   POST /api/study-rooms/:id/join
// @desc    Tham gia một phòng học
// @access  Private
router.post('/:id/join', auth, async (req, res) => {
  try {
    const room = await StudyRoom.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ msg: 'Không tìm thấy phòng học' });
    }

    // Kiểm tra xem người dùng đã là thành viên hay chưa
    // .some() sẽ trả về true nếu có ít nhất một phần tử thỏa mãn điều kiện
    const isMember = room.members.some(member => member.equals(req.user.id));
    if (isMember) {
      return res.status(400).json({ msg: 'Bạn đã là thành viên của phòng này' });
    }

    // Thêm user ID vào mảng members
    room.members.push(req.user.id);
    await room.save();
    
    // Trả về thông tin phòng đã được cập nhật
    const updatedRoom = await StudyRoom.findById(req.params.id).populate('members', ['email']);
    res.json(updatedRoom);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;