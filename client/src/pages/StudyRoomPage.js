import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client'; 
import { jwtDecode } from 'jwt-decode'; 
import ChatBox from '../components/ChatBox';

const StudyRoomPage = () => {
  const { id: roomId } = useParams(); 
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  const socketRef = useRef(null); 

  // EFFECT 1: LẤY THÔNG TIN PHÒNG HỌC VÀ ID NGƯỜI DÙNG 
  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const decodedToken = jwtDecode(token);  
          setCurrentUserId(decodedToken.user.id);
        }

        const config = { headers: { 'x-auth-token': token } };
        const res = await axios.get(`http://localhost:5000/api/study-rooms/${roomId}`, config);
        setRoom(res.data);
      } catch (err) {
        console.error('Không thể lấy thông tin phòng', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoomDetails();
  }, [roomId]); 

  // EFFECT 2: THIẾT LẬP KẾT NỐI SOCKET.IO 
  useEffect(() => {
    if (!currentUserId) return;

    socketRef.current = io('http://localhost:5000');
    const socket = socketRef.current;

    socket.emit('joinRoom', { userId: currentUserId, roomId });

    socket.on('newMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on('userJoined', (notification) => {
        const systemMessage = {
            user: { id: 'system', email: 'Hệ thống' }, 
            text: notification.message,
            timestamp: new Date()
        }
        setMessages((prevMessages) => [...prevMessages, systemMessage]);
    });

    return () => {
      socket.emit('leaveRoom', { userId: currentUserId, roomId });
      socket.disconnect();
    };
  }, [roomId, currentUserId]); 

  const handleSendMessage = (messageText) => {
    if (socketRef.current) {
      socketRef.current.emit('sendMessage', {
        userId: currentUserId,
        roomId: roomId,
        message: messageText,
      });
    }
  };
  
  if (loading) return <div>Đang tải phòng học...</div>;
  if (!room) return <div>Không tìm thấy phòng học.</div>;

  return (
    <div style={{ padding: '1rem 2rem' }}>
      <Link to="/">&larr; Quay lại Trang Chủ</Link>
      <h2>{room.name}</h2>
      <p>{room.description}</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '2rem' }}>
        {/* Phần chính (sau này có thể là video/whiteboard) */}
        <div>
          <div style={{ border: '1px solid black', height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            Khu vực học tập chính
          </div>
        </div>
        
        {/* Phần Chat và danh sách thành viên */}
        <div>
          <ChatBox 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            currentUserId={currentUserId}
          />
          <div style={{ marginTop: '1rem' }}>
            <h4>Thành viên ({room.members.length})</h4>
            <ul>
              {room.members.map(member => (
                <li key={member._id}>{member.email}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyRoomPage;