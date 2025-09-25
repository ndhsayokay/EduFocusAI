// File: server/middleware/auth.js

const jwt = require('jsonwebtoken');

// Middleware là một hàm có 3 tham số: req, res, next
module.exports = function (req, res, next) {
  // 1. Lấy token từ header của request
  const token = req.header('x-auth-token');

  // 2. Kiểm tra xem token có tồn tại không
  if (!token) {
    // Nếu không có token, trả về lỗi 401 (Unauthorized)
    // Client sẽ biết là họ cần phải đăng nhập
    return res.status(401).json({ msg: 'Không có token, truy cập bị từ chối' });
  }

  // 3. Nếu có token, xác thực nó
  try {
    // Dùng jwt.verify để giải mã token với "chìa khóa bí mật"
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Nếu token hợp lệ, `decoded` sẽ chứa payload mà chúng ta đã đưa vào lúc đăng nhập
    // Ví dụ: { user: { id: '...' }, iat: ..., exp: ... }

    // Gắn thông tin user từ token vào đối tượng request
    // Để các route phía sau có thể truy cập được (ví dụ: req.user.id)
    req.user = decoded.user;

    // QUAN TRỌNG NHẤT: Gọi next() để cho phép request đi tiếp đến route xử lý chính
    next();

  } catch (err) {
    // Nếu jwt.verify gặp lỗi (token sai, hết hạn), nó sẽ nhảy vào khối catch
    res.status(401).json({ msg: 'Token không hợp lệ' });
  }
};