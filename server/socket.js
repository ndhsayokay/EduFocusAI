const User = require('./models/User'); 

// Tạo bộ nhớ lưu trữ trạng thái online
// Key: userId (String), Value: socket.id (String)
const onlineUsers = new Map();

module.exports = function (io) {
  // Lắng nghe sự kiện 'connection' - xảy ra khi một client kết nối tới server
  io.on('connection', (socket) => {
    
    // === SỰ KIỆN 1: USER KHAI BÁO DANH TÍNH KHI ONLINE ===
    socket.on('userOnline', async (userId) => {
      if (!userId) return;

      console.log(`User ${userId} đã online với socket ${socket.id}`);
      
      // Lưu thông tin user và socket.id vào Map
      onlineUsers.set(userId, socket.id);

      try {
        // Lấy danh sách bạn bè của user này
        const user = await User.findById(userId).select('friends');
        if (user && user.friends) {
          // Lọc ra những người bạn đang online
          const onlineFriendIds = user.friends.filter(friendId => onlineUsers.has(friendId.toString()));
          
          // Gửi sự kiện 'friendsOnline' CHỈ ĐẾN user vừa kết nối
          // kèm theo danh sách bạn bè của họ đang online
          const onlineFriendsList = onlineFriendIds.map(id => id.toString());
          socket.emit('friendsOnline', onlineFriendsList);

          // Thông báo cho những người bạn đó rằng user này vừa online
          onlineFriendIds.forEach(friendId => {
            const friendSocketId = onlineUsers.get(friendId.toString());
            if (friendSocketId) {
              io.to(friendSocketId).emit('friendCameOnline', userId);
            }
          });
        }
      } catch (err) {
        console.error('Lỗi khi xử lý userOnline:', err);
      }
    });

    // === SỰ KIỆN 2: USER THAM GIA MỘT PHÒNG HỌC ===
    socket.on('joinRoom', async ({ userId, roomId }) => {
      try {
        // Cho socket này vào một "kênh" riêng dựa trên roomId
        socket.join(roomId);
        console.log(`User ${userId} đã tham gia phòng ${roomId}`);

        // Lấy thông tin người dùng vừa tham gia để hiển thị tên
        const user = await User.findById(userId).select('email');

        // Gửi thông báo tới TẤT CẢ mọi người trong phòng, TRỪ người vừa tham gia
        socket.to(roomId).emit('userJoined', {
          message: `${user ? user.email : 'Một người dùng'} vừa tham gia phòng.`,
        });
      } catch (err) {
        console.error('Lỗi khi tham gia phòng:', err);
      }
    });

    // === SỰ KIỆN 3: USER GỬI MỘT TIN NHẮN TRONG PHÒNG ===
    socket.on('sendMessage', async ({ userId, roomId, message }) => {
      try {
        const user = await User.findById(userId).select('email');
        const messageData = {
          user: {
            id: userId,
            email: user ? user.email : 'Ẩn danh',
          },
          text: message,
          timestamp: new Date(),
        };

        // Gửi tin nhắn tới TẤT CẢ mọi người trong phòng, BAO GỒM cả người gửi
        io.to(roomId).emit('newMessage', messageData);
      } catch (err) {
        console.error('Lỗi khi gửi tin nhắn:', err);
      }
    });

    // === SỰ KIỆN 4: USER CHỦ ĐỘNG RỜI MỘT PHÒNG HỌC ===
    socket.on('leaveRoom', async ({ userId, roomId }) => {
        try {
            socket.leave(roomId);
            console.log(`User ${userId} đã rời phòng ${roomId}`);
            
            const user = await User.findById(userId).select('email');
            
            // Gửi thông báo cho những người còn lại trong phòng
            socket.to(roomId).emit('userLeft', {
                message: `${user ? user.email : 'Một người dùng'} đã rời phòng.`
            });
        } catch(err) {
            console.error('Lỗi khi rời phòng:', err);
        }
    });


    // === SỰ KIỆN 5: USER NGẮT KẾT NỐI (ĐÓNG TRÌNH DUYỆT) ===
    socket.on('disconnect', async () => {
      let disconnectedUserId = null;
      // Tìm userId tương ứng với socket.id vừa ngắt kết nối
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          break;
        }
      }

      if (disconnectedUserId) {
        console.log(`User ${disconnectedUserId} đã offline`);
        
        // Xóa user khỏi danh sách online
        onlineUsers.delete(disconnectedUserId);
        
        try {
            // Thông báo cho bạn bè của họ biết họ đã offline
            const user = await User.findById(disconnectedUserId).select('friends');
            if (user && user.friends) {
                user.friends.forEach(friendId => {
                    const friendSocketId = onlineUsers.get(friendId.toString());
                    if (friendSocketId) {
                        io.to(friendSocketId).emit('friendWentOffline', disconnectedUserId);
                    }
                });
            }
        } catch (err) {
            console.error('Lỗi khi xử lý disconnect:', err);
        }
      }
    });
  });
};