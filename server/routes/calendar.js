// server/routes/calendar.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');

// @route   GET /api/calendar
// @desc    Lấy các task có dueDate trong một khoảng thời gian
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // Lấy ngày bắt đầu và kết thúc từ query params của URL
        // /api/calendar?start=2025-10-01T00:00:00.000Z&end=2025-11-01T00:00:00.000Z
        const { start, end } = req.query;

        if (!start || !end) {
            return res.status(400).json({ msg: 'Vui lòng cung cấp khoảng thời gian (start, end)' });
        }

        const tasks = await Task.find({
            userId: req.user.id,
            dueDate: { 
                $gte: new Date(start), 
                $lte: new Date(end)   
            }
        });

        const events = tasks.map(task => ({
            id: task._id,       
            title: task.title, 
            date: task.dueDate 
        }));

        res.json(events);

    } catch (err) {
        console.error("Lỗi trong API calendar:", err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;