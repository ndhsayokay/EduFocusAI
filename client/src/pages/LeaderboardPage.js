import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const LeaderboardPage = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [period, setPeriod] = useState('weekly'); 
  const [loading, setLoading] = useState(true);

    useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: { 'x-auth-token': token },
          params: { period } 
        };
        const res = await axios.get('http://localhost:5000/api/leaderboard', config);
        setLeaderboardData(res.data);
      } catch (err) {
        if (err.response) {
            console.error('Lỗi từ server:', err.response.data);
            console.error('Status code:', err.response.status);
        } else if (err.request) {
            console.error('Không nhận được phản hồi từ server:', err.request);
        } else {
            console.error('Lỗi khi thiết lập request:', err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [period]);

  const renderRankIcon = (rank) => {
    if (rank === 0) return '🥇'; // Vàng
    if (rank === 1) return '🥈'; // Bạc
    if (rank === 2) return '🥉'; // Đồng
    return rank + 1; 
  };

  return (
    <div style={{ padding: '1rem 2rem', maxWidth: '800px', margin: 'auto' }}>
      <Link to="/">&larr; Quay lại Trang Chủ</Link>
      <h1 style={{ textAlign: 'center' }}>Bảng Xếp Hạng</h1>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button onClick={() => setPeriod('weekly')} disabled={period === 'weekly'} style={period === 'weekly' ? activeButtonStyle : buttonStyle}>
          Tuần Này
        </button>
        <button onClick={() => setPeriod('monthly')} disabled={period === 'monthly'} style={period === 'monthly' ? activeButtonStyle : buttonStyle}>
          Tháng Này
        </button>
      </div>

      {loading ? (
        <p>Đang tải bảng xếp hạng...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid black' }}>
              <th style={tableHeaderStyle}>Hạng</th>
              <th style={tableHeaderStyle}>Người Dùng</th>
              <th style={tableHeaderStyle}>Tổng Giờ Học</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((user, index) => (
              <tr key={user.userId} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ ...tableCellStyle, fontSize: '1.5rem', fontWeight: 'bold' }}>{renderRankIcon(index)}</td>
                <td style={tableCellStyle}>{user.email}</td>
                <td style={tableCellStyle}>{user.totalHours.toFixed(2)} giờ</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      { !loading && leaderboardData.length === 0 && <p style={{textAlign: 'center'}}>Chưa có dữ liệu cho bảng xếp hạng.</p> }
    </div>
  );
};

const buttonStyle = { padding: '0.5rem 1rem', margin: '0 0.5rem', cursor: 'pointer' };
const activeButtonStyle = { ...buttonStyle, backgroundColor: '#007bff', color: 'white' };
const tableHeaderStyle = { padding: '0.75rem', textAlign: 'left' };
const tableCellStyle = { padding: '0.75rem' };

export default LeaderboardPage;