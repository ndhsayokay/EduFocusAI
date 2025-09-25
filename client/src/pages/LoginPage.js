// client/src/pages/LoginPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // 1. Import thêm Link
import { toast } from 'react-toastify'; // 2. Import toast

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false); // 3. Thêm state loading

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Bật loading
    const user = { email, password };
    try {
      // Bỏ http://localhost:5000 vì đã có proxy
      const res = await axios.post('/api/auth/login', user);
      
      const { token } = res.data;
      localStorage.setItem('token', token);
      
      toast.success('Đăng nhập thành công!'); // 4. Dùng toast thay alert
      
      navigate('/'); 
      window.location.reload(); 

    } catch (err) {
      console.error(err.response.data);
      toast.error(err.response.data.msg || 'Có lỗi xảy ra'); // Dùng toast cho lỗi
    } finally {
      setLoading(false); // Tắt loading
    }
  };

  return (
    // 5. Áp dụng layout mới
    <div className="auth-container">
      <div className="auth-card">
        <h1>Đăng Nhập</h1>
        <p>Chào mừng trở lại!</p>
        <form onSubmit={onSubmit} className="auth-form">
          <div className="form-group">
            <input 
              type="email" 
              placeholder="Email" 
              name="email" 
              value={email} 
              onChange={onChange} 
              required 
              className="form-control" // Áp dụng class
            />
          </div>
          <div className="form-group">
            <input 
              type="password" 
              placeholder="Mật khẩu" 
              name="password" 
              value={password} 
              onChange={onChange} 
              required 
              className="form-control" // Áp dụng class
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        {/* 6. Thêm link để chuyển sang trang Đăng ký */}
        <p className="auth-switch-link">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;