import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserProfile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            'x-auth-token': token,
          },
        };
        const res = await axios.get('http://localhost:5000/api/auth/me', config);
        setUser(res.data); 
      } catch (err) {
        console.error('Không thể lấy thông tin người dùng', err);
      }
    };

    fetchUserData();
  }, []); 

  
  if (!user) {
    return <p>Đang tải thông tin cá nhân...</p>;
  }

  const { gamification } = user;
  const { level, xp, xpToNextLevel, virtualPet } = gamification;
  
  const xpPercentage = (xp / xpToNextLevel) * 100;

  const petImageSrc = `/pets/pet-${virtualPet.status}.png`;

  return (
    <div className="card user-profile">
      <div className="user-profile-avatar">
        <img src={petImageSrc} alt={`Thú ảo đang ${virtualPet.status}`} />
        <h4 style={{textAlign: 'center', marginTop: '0.5rem'}}>{virtualPet.name}</h4>
      </div>
      
      <div className="user-profile-info">
        <h3>Xin chào, {user.email}</h3>
        <p><strong>Cấp độ: {level}</strong></p>
        
        <div>
          <p>Tiến độ: {Math.round(xp)} / {xpToNextLevel} XP</p>
          <div className="progress-bar">
            <div className="progress-bar-inner" style={{ width: `${xpPercentage}%` }}>
              {Math.round(xpPercentage)}%
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <strong>Huy hiệu:</strong>
          {/* ... */}
        </div>
      </div>
    </div>
);
};

export default UserProfile;