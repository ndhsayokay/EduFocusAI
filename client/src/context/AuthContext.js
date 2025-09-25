// client/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [socket, setSocket] = useState(null);
    const [onlineFriends, setOnlineFriends] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedUser = jwtDecode(token).user;
            setUser(decodedUser);

            const newSocket = io('http://localhost:5000');
            setSocket(newSocket);

            // Gửi thông tin định danh cho server
            newSocket.emit('userOnline', decodedUser.id);

            // Lắng nghe danh sách bạn bè online ban đầu
            newSocket.on('friendsOnline', (friendsList) => {
                setOnlineFriends(friendsList);
            });

            // Lắng nghe khi có bạn mới online
            newSocket.on('friendCameOnline', (friendId) => {
                setOnlineFriends(prev => [...prev, friendId]);
            });

            // Lắng nghe khi có bạn offline
            newSocket.on('friendWentOffline', (friendId) => {
                setOnlineFriends(prev => prev.filter(id => id !== friendId));
            });

            // Dọn dẹp khi unmount
            return () => newSocket.disconnect();
        }
    }, []);

    const value = {
        user,
        socket,
        onlineFriends
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};