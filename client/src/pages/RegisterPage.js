// client/src/pages/RegisterPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password2: '',
  });
  const [loading, setLoading] = useState(false);

  const { email, password, password2 } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== password2) {
      toast.error('Mật khẩu không khớp!');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/auth/register', { email, password });
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response.data.msg || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Tạo Tài Khoản</h1>
        <p>Bắt đầu hành trình học tập của bạn</p>
        <form onSubmit={onSubmit} className="auth-form">
          <div className="form-group">
            <input type="email" placeholder="Email" name="email" value={email} onChange={onChange} required className="form-control" />
          </div>
          <div className="form-group">
            <input type="password" placeholder="Mật khẩu (ít nhất 6 ký tự)" name="password" value={password} onChange={onChange} required minLength="6" className="form-control" />
          </div>
          <div className="form-group">
            <input type="password" placeholder="Xác nhận mật khẩu" name="password2" value={password2} onChange={onChange} required minLength="6" className="form-control" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Đang tạo...' : 'Đăng ký'}
          </button>
        </form>

        <p className="auth-switch-link">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;