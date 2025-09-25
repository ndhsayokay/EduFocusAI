const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

//  1. GỬI YÊU CẦU KẾT BẠN 
// @route   POST /api/friends/request/:userId
router.post('/request/:userId', auth, async (req, res) => {
  try {
    const recipient = await User.findById(req.params.userId);
    const sender = await User.findById(req.user.id);

    if (!recipient) return res.status(404).json({ msg: 'Không tìm thấy người dùng' });
    if (recipient.id === sender.id) return res.status(400).json({ msg: 'Không thể tự kết bạn với chính mình' });
    
    // Kiểm tra xem đã là bạn, hoặc đã gửi/nhận yêu cầu chưa
    if (sender.friends.includes(recipient.id)) return res.status(400).json({ msg: 'Bạn và người này đã là bạn bè' });
    if (sender.friendRequestsSent.includes(recipient.id)) return res.status(400).json({ msg: 'Bạn đã gửi yêu cầu kết bạn cho người này rồi' });
    if (sender.friendRequestsReceived.includes(recipient.id)) return res.status(400).json({ msg: 'Người này đã gửi yêu cầu cho bạn, hãy vào mục "Yêu cầu kết bạn" để chấp nhận' });

    // Thêm yêu cầu
    sender.friendRequestsSent.push(recipient.id);
    recipient.friendRequestsReceived.push(sender.id);
    
    await sender.save();
    await recipient.save();

    res.json({ msg: 'Đã gửi yêu cầu kết bạn thành công!' });
  } catch (err) { 
    console.error("Lỗi server khi gửi yêu cầu kết bạn:", err.message); 
    res.status(500).send('Server Error'); 
  }
});

//  2. CHẤP NHẬN YÊU CẦU KẾT BẠN 
// @route   POST /api/friends/accept/:senderId
router.post('/accept/:senderId', auth, async (req, res) => {
  try {
    const sender = await User.findById(req.params.senderId);
    const recipient = await User.findById(req.user.id);

    if (!sender) return res.status(404).json({ msg: 'Không tìm thấy người dùng' });

    // Kiểm tra xem có yêu cầu từ người này không
    if (!recipient.friendRequestsReceived.includes(sender.id)) {
      return res.status(400).json({ msg: 'Không có yêu cầu kết bạn từ người này' });
    }

    // Thêm vào danh sách bạn bè của cả hai
    recipient.friends.push(sender.id);
    sender.friends.push(recipient.id);

    // Xóa yêu cầu khỏi danh sách chờ
    recipient.friendRequestsReceived = recipient.friendRequestsReceived.filter(id => !id.equals(sender.id));
    sender.friendRequestsSent = sender.friendRequestsSent.filter(id => !id.equals(recipient.id));

    await recipient.save();
    await sender.save();

    res.json({ msg: 'Đã chấp nhận yêu cầu kết bạn' });
  } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
});


// 3. TỪ CHỐI/HỦY YÊU CẦU KẾT BẠN 
// @route   POST /api/friends/decline/:senderId
router.post('/decline/:senderId', auth, async (req, res) => {
  try {
      const sender = await User.findById(req.params.senderId);
      const recipient = await User.findById(req.user.id);

      if (!sender) return res.status(404).json({ msg: 'Không tìm thấy người dùng' });

      // Xóa yêu cầu
      recipient.friendRequestsReceived = recipient.friendRequestsReceived.filter(id => !id.equals(sender.id));
      sender.friendRequestsSent = sender.friendRequestsSent.filter(id => !id.equals(recipient.id));

      await recipient.save();
      await sender.save();
      
      res.json({ msg: 'Đã từ chối yêu cầu' });
  } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
});


// 4. HỦY KẾT BẠN 
// @route   DELETE /api/friends/:friendId
router.delete('/:friendId', auth, async (req, res) => {
  try {
    const friend = await User.findById(req.params.friendId);
    const me = await User.findById(req.user.id);
    
    if (!friend) return res.status(404).json({ msg: 'Không tìm thấy người dùng' });

    // Xóa bạn khỏi danh sách của cả hai
    me.friends = me.friends.filter(id => !id.equals(friend.id));
    friend.friends = friend.friends.filter(id => !id.equals(me.id));

    await me.save();
    await friend.save();

    res.json({ msg: 'Đã hủy kết bạn' });
  } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
});

// 5. LẤY DANH SÁCH BẠN BÈ 
// @route   GET /api/friends
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends', 'email');
    res.json(user.friends);
  } catch (err) { 
    console.error(err.message); 
    res.status(500).send('Server Error'); 
  }
});
// 6. LẤY DANH SÁCH YÊU CẦU ĐANG CHỜ 
// @route   GET /api/friends/requests
router.get('/requests', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friendRequestsReceived', 'email');
    res.json(user.friendRequestsReceived);
  } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
});


module.exports = router;