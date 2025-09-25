const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');

router.post('/', auth, async (req, res) => {
  try {
    const { title, description, dueDate, priority } = req.body;

    if (!title) {
      return res.status(400).json({ msg: 'Vui lòng nhập nội dung công việc' });
    }

    const newTask = new Task({
      title,
      description,
      dueDate,
      priority,
      userId: req.user.id,
    });

    const task = await newTask.save();
    res.status(201).json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, dueDate, priority, status } = req.body;

    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: 'Không tìm thấy công việc' });
    if (task.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'Không được phép truy cập' });

    const updatedFields = {};
    if (title !== undefined) updatedFields.title = title;
    if (description !== undefined) updatedFields.description = description;
    if (dueDate !== undefined) updatedFields.dueDate = dueDate;
    if (priority !== undefined) updatedFields.priority = priority;
    if (status !== undefined) updatedFields.status = status;

    if (Object.keys(updatedFields).length === 0) {
        return res.json(task);
    }
    
    const updatedTask = await Task.findByIdAndUpdate(
        req.params.id,
        { $set: updatedFields },
        { new: true } 
    );
    
    res.json(updatedTask);
  } catch (err) {
    console.error("LỖI TRONG API PUT /api/tasks/:id:", err.message);
    res.status(500).send('Server Error');
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: 'Không tìm thấy công việc' });
    if (task.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'Không được phép truy cập' });
    
    await task.deleteOne();
    res.json({ msg: 'Công việc đã được xóa' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


router.post('/:id/subtasks', auth, async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) return res.status(400).json({ msg: 'Vui lòng nhập nội dung công việc con' });
        
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Không tìm thấy công việc chính' });
        if (task.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'Không được phép truy cập' });

        const newSubtask = { title, isCompleted: false };
        task.subtasks.push(newSubtask);
        
        await task.save();
        res.status(201).json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.put('/:id/subtasks/:subtaskId', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Không tìm thấy công việc chính' });
        if (task.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'Không được phép truy cập' });
        
        // Tìm subtask trong mảng subtasks
        const subtask = task.subtasks.id(req.params.subtaskId);
        if (!subtask) return res.status(404).json({ msg: 'Không tìm thấy công việc con' });

        // Cập nhật trạng thái (đảo ngược trạng thái hiện tại)
        subtask.isCompleted = !subtask.isCompleted;

        await task.save();
        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/tasks/:id/subtasks
router.post('/:id/subtasks', auth, async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) {
            // Lỗi 400 nếu không có title
            return res.status(400).json({ msg: 'Vui lòng nhập nội dung công việc con' });
        }
        
        const task = await Task.findById(req.params.id);
        if (!task) {
            // Lỗi 404 nếu không tìm thấy task cha
            return res.status(404).json({ msg: 'Không tìm thấy công việc chính' });
        }
        if (task.userId.toString() !== req.user.id) {
            // Lỗi 401 nếu không có quyền
            return res.status(401).json({ msg: 'Không được phép truy cập' });
        }

        // Tạo một object subtask mới
        const newSubtask = { 
            title: title, 
            isCompleted: false 
        };

        // Thêm subtask mới vào đầu hoặc cuối mảng
        task.subtasks.unshift(newSubtask); // unshift để thêm vào đầu
        
        // Lưu lại toàn bộ document task
        await task.save();

        // Trả về toàn bộ task đã được cập nhật
        res.status(201).json(task);
    } catch (err) {
        console.error("LỖI TRONG API THÊM SUBTASK:", err.message); // Thêm log chi tiết
        res.status(500).send('Server Error');
    }
});
module.exports = router;