import React, { useState, useEffect, useCallback } from 'react'; 
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const FriendsPage = () => {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { onlineFriends } = useAuth();

  const tokenConfig = useCallback(() => {
    const token = localStorage.getItem('token');
    return { 
      headers: { 
        'Content-Type': 'application/json',
        'x-auth-token': token 
      } 
    };
  }, []); 

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [friendsRes, requestsRes] = await Promise.all([
          axios.get('/api/friends', tokenConfig()),
          axios.get('/api/friends/requests', tokenConfig())
        ]);
        setFriends(friendsRes.data);
        setRequests(requestsRes.data);
      } catch (err) { 
        console.error("Lỗi khi tải dữ liệu bạn bè:", err); 
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tokenConfig]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    try {
      const res = await axios.get(`/api/users/search?q=${searchTerm}`, tokenConfig());
      setSearchResults(res.data);
    } catch (err) { 
      console.error("Lỗi khi tìm kiếm:", err); 
    }
  };

  const handleAction = async (action, userId) => {
    try {
        let res;
        const config = tokenConfig();
        
        switch (action) {
            case 'add':
                res = await axios.post(`/api/friends/request/${userId}`, {}, config); 
                toast.success(res.data.msg);
                setSearchResults(prev => prev.filter(user => user._id !== userId));
                break;
            case 'accept':
                res = await axios.post(`/api/friends/accept/${userId}`, {}, config);
                toast.success(res.data.msg);
                break;
            case 'decline':
                res = await axios.post(`/api/friends/decline/${userId}`, {}, config);
                toast.success(res.data.msg);
                break;
            case 'remove':
                if (window.confirm('Bạn có chắc muốn hủy kết bạn?')) {
                    res = await axios.delete(`/api/friends/${userId}`, config);
                    toast.success(res.data.msg);
                }
                break;
            default:
                return;
        }
        window.location.reload();
    } catch (err) {
        toast.error(err.response?.data?.msg || 'Có lỗi xảy ra');
    }
};

  if (loading) {
      return <div>Đang tải dữ liệu...</div>
  }
  
  return (
    <div className="container">
      <Link to="/" className="btn" style={{marginBottom: '1rem'}}>&larr; Quay lại Trang Chủ</Link>
      <h1>Quản Lý Bạn Bè</h1>
      
      {/* Search Section */}
      <div className="card">
        <h3>Tìm kiếm người dùng</h3>
        <form onSubmit={handleSearch} style={{ display: 'flex' }}>
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Nhập email..." className="form-control" style={{marginBottom: 0, marginRight: '0.5rem'}} />
          <button type="submit" className="btn btn-primary">Tìm</button>
        </form>
        {searchResults.map(user => (
          <div key={user._id} className="list-item">
            <span>{user.email}</span>
            <button onClick={() => handleAction('add', user._id)} className="btn btn-primary">Kết bạn</button>
          </div>
        ))}
      </div>

      {/* Friend Requests Section */}
      <div className="card">
        <h3>Yêu cầu kết bạn ({requests.length})</h3>
        {requests.map(user => (
          <div key={user._id} className="list-item">
            <span>{user.email}</span>
            <div>
              <button onClick={() => handleAction('accept', user._id)} className="btn btn-success">Chấp nhận</button>
              <button onClick={() => handleAction('decline', user._id)} className="btn" style={{marginLeft: '0.5rem'}}>Từ chối</button>
            </div>
          </div>
        ))}
        {requests.length === 0 && <p>Không có yêu cầu nào.</p>}
      </div>

      {/* Friends List Section */}
      <div className="card">
        <h3>Bạn bè ({friends.length})</h3>
        {friends.map(user => (
          <div key={user._id} className="list-item">
             <div>
                <span style={{
                    height: '10px',
                    width: '10px',
                    backgroundColor: onlineFriends.includes(user._id) ? 'var(--success-color)' : 'var(--secondary-color)',
                    borderRadius: '50%',
                    display: 'inline-block',
                    marginRight: '8px'
                }}></span>
                <span>{user.email}</span>
            </div>
            <button onClick={() => handleAction('remove', user._id)} className="btn btn-danger">Hủy kết bạn</button>
          </div>
        ))}
        {friends.length === 0 && <p>Bạn chưa có người bạn nào.</p>}
      </div>
    </div>
);
};

const sectionStyle = { border: '1px solid #ddd', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' };
const itemStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', borderBottom: '1px solid #eee' };

export default FriendsPage;