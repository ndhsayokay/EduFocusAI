// client/src/components/Sidebar.js
import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
        window.location.reload();
    };
    
    const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : '?';

    return (
        <aside className="sidebar">
            <div className="sidebar-user">
                <div className="sidebar-user-avatar">{userInitial}</div>
                <p>{user?.email}</p>
            </div>

            <ul className="sidebar-nav">
                <li style={{padding: '0 1.5rem 1rem 1.5rem'}}>
                    {/* Bây giờ thẻ <Link> này đã được định nghĩa và sẽ hoạt động */}
                    <Link to="/focus" className="btn btn-primary" style={{width: '100%'}}>Bắt Đầu Học</Link>
                </li>
                <li><NavLink to="/">Dashboard</NavLink></li>
                <li><NavLink to="/todo">Công Việc</NavLink></li>
                <li><NavLink to="/calendar">Lịch</NavLink></li>
                <li><NavLink to="/reports">Báo Cáo</NavLink></li>
                <li><NavLink to="/rooms">Phòng Học</NavLink></li>
                <li><NavLink to="/leaderboard">Bảng Xếp Hạng</NavLink></li>
                <li><NavLink to="/friends">Bạn Bè</NavLink></li>
            </ul>

            <div className="sidebar-logout">
                <button onClick={handleLogout} className="btn" style={{ width: '100%', backgroundColor: '#4a4a4a', color: 'white' }}>
                    Đăng xuất
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;