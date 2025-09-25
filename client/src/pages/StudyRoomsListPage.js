import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const StudyRoomsListPage = () => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      const res = await axios.get('http://localhost:5000/api/study-rooms', config);
      setRooms(res.data);
    };
    fetchRooms();
  }, []);

  return (
    <div style={{ padding: '1rem 2rem' }}>
      <h1>Danh Sách Phòng Học</h1>
      <div>
        {rooms.map(room => (
          <div key={room._id} style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>
            <h3>{room.name}</h3>
            <p>Chủ phòng: {room.owner.email}</p>
            <p>{room.description}</p>
            <Link to={`/rooms/${room._id}`}>Tham gia phòng</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyRoomsListPage;