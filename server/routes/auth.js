const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // Thư viện mã hóa mật khẩu
const jwt = require('jsonwebtoken'); // Thư viện tạo token (thẻ ra vào)
const User = require('../models/User'); // Import "khuôn mẫu" User
const auth = require('../middleware/auth'); 

// API ENDPOINT: ĐĂNG KÝ (/api/auth/register) 
router.post('/register', async (req, res) => {
  // Lấy email và password từ "thân" của request gửi lên
  const { email, password } = req.body;

  try {
    // 1. Kiểm tra xem email đã tồn tại trong database chưa
    let user = await User.findOne({ email });
    if (user) {
      // Nếu đã tồn tại, trả về lỗi 400 (Bad Request)
      return res.status(400).json({ msg: 'Email đã tồn tại' });
    }

    // 2. Nếu email chưa tồn tại, tạo một user mới từ "khuôn mẫu"
    user = new User({
      email,
      password,
    });

    // 3. Mã hóa mật khẩu trước khi lưu vào database
    const salt = await bcrypt.genSalt(10); 
    user.password = await bcrypt.hash(password, salt); 

    // 4. Lưu user mới vào database
    await user.save();

    // 5. Trả về thông báo thành công
    res.status(201).json({ msg: 'Đăng ký thành công!' });
    
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Lỗi Server');
  }
});

// API ENDPOINT: ĐĂNG NHẬP (/api/auth/login) 
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Tìm user trong database bằng email
        let user = await User.findOne({ email });
        if (!user) {
            // Nếu không tìm thấy user, báo lỗi
            return res.status(400).json({ msg: 'Email hoặc mật khẩu không đúng' });
        }

        // 2. So sánh mật khẩu người dùng nhập với mật khẩu đã mã hóa trong DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Nếu mật khẩu không khớp, báo lỗi
            return res.status(400).json({ msg: 'Email hoặc mật khẩu không đúng' });
        }

        // 3. Nếu thông tin chính xác, tạo một "thẻ ra vào" (JSON Web Token)
        const payload = {
            user: {
                id: user.id, 
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }, 
            (err, token) => {
                if (err) throw err;
                // 4. Gửi thẻ ra vào (token) về cho client
                res.json({ token });
            }
        );
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Lỗi Server');
    }
});

// @route   GET /api/auth/me
// @desc    Lấy thông tin người dùng đang đăng nhập
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    // req.user.id được lấy từ token sau khi đi qua middleware 'auth'
    // .select('-password') để loại bỏ trường password khỏi kết quả trả về, tăng cường bảo mật
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'Không tìm thấy người dùng' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;