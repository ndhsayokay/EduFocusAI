import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TaskList = () => {
  // State để lưu danh sách các task lấy từ backend
  const [tasks, setTasks] = useState([]);
  // State để lưu nội dung người dùng đang gõ trong ô input
  const [newTaskText, setNewTaskText] = useState('');
   const [loading, setLoading] = useState(false); 

  // Hàm để lấy token từ localStorage
  const getTokenConfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
    };
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const config = getTokenConfig();
        const res = await axios.get('http://localhost:5000/api/tasks', config);
        setTasks(res.data); // Cập nhật state với dữ liệu nhận được
      } catch (err) {
        console.error('Không thể lấy danh sách công việc', err);
      }
    };

    fetchTasks();
  }, []); 

  const handleAddTask = async (e) => {
    e.preventDefault(); // Ngăn form submit và tải lại trang
    if (newTaskText.trim() === '') return; // Không thêm task rỗng
    setLoading(true); 
    try {
      const config = getTokenConfig();
      const body = JSON.stringify({ title: newTaskText });
      const res = await axios.post('http://localhost:5000/api/tasks', body, config);
      
      // Cập nhật giao diện ngay lập tức bằng cách thêm task mới vào đầu danh sách
      setTasks([res.data, ...tasks]);
      setNewTaskText(''); // Xóa nội dung trong ô input
    } catch (err) {
      console.error('Lỗi khi thêm công việc', err);
    } finally {
      setLoading(false); 
    }

  };

  const handleToggleTask = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'todo' ? 'completed' : 'todo';
      const config = getTokenConfig();
      const body = JSON.stringify({ status: newStatus });
      
      const res = await axios.put(`http://localhost:5000/api/tasks/${id}`, body, config);

      // Cập nhật lại task đã thay đổi trong danh sách trên giao diện
      setTasks(tasks.map(task => (task._id === id ? res.data : task)));
    } catch (err) {
      console.error('Lỗi khi cập nhật công việc', err);
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa công việc này?')) {
      try {
        const config = getTokenConfig();
        await axios.delete(`http://localhost:5000/api/tasks/${id}`, config);

        setTasks(tasks.filter(task => task._id !== id));
      } catch (err) {
        console.error('Lỗi khi xóa công việc', err);
      }
    }
  };
  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', marginTop: '2rem' }}>
      <h3>Danh sách công việc</h3>
      <form onSubmit={handleAddTask} style={{ display: 'flex', marginBottom: '1rem' }}>
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Thêm công việc mới..."
          style={{ flexGrow: 1, marginRight: '0.5rem', padding: '0.5rem' }}
        />
        <button type="submit" disabled={loading}>
        {loading ? 'Đang thêm...' : 'Thêm'}
      </button>
      </form>

      <div>
        {tasks.map(task => (
          <div key={task._id} style={{ display: 'flex', alignItems: 'center', padding: '0.5rem', borderBottom: '1px solid #eee' }}>
            <input
              type="checkbox"
              checked={task.status === 'completed'}
              onChange={() => handleToggleTask(task._id, task.status)}
              style={{ marginRight: '1rem' }}
            />
            <span style={{ textDecoration: task.status === 'completed' ? 'line-through' : 'none', flexGrow: 1 }}>
              {task.title}
            </span>
            <button onClick={() => handleDeleteTask(task._id)} style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', cursor: 'pointer' }}>
              Xóa
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;