// client/src/pages/TodoPage.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { isToday } from 'date-fns';
import { toast } from 'react-toastify';

import TaskItem from '../components/TaskItem';
import TaskDetail from '../components/TaskDetail';
import '../TodoPage.css';

const TodoPage = () => {
    const [allTasks, setAllTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    const tokenConfig = useCallback(() => {
        const token = localStorage.getItem('token');
        return { headers: { 'x-auth-token': token, 'Content-Type': 'application/json' } };
    }, []);

    useEffect(() => {
        const fetchTasks = async () => {
            setLoading(true);
            try {
                const res = await axios.get('/api/tasks', tokenConfig());
                setAllTasks(res.data);
            } catch (err) {
                toast.error('Không thể tải công việc');
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, [tokenConfig]);

    const filteredTasks = useMemo(() => {
        switch (activeFilter) {
            case 'today':
                return allTasks.filter(task => task.dueDate && isToday(new Date(task.dueDate)));
            case 'important':
                return allTasks.filter(task => task.priority === 'high');
            case 'all':
            default:
                return allTasks;
        }
    }, [allTasks, activeFilter]);
    

    const handleUpdateTask = async (taskId, updatedData) => {
    const originalTasks = [...allTasks]; 
    const updatedTaskLocally = { ...allTasks.find(t => t._id === taskId), ...updatedData };
    
    setAllTasks(prevTasks => prevTasks.map(task => 
        task._id === taskId ? updatedTaskLocally : task
    ));
    if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask(updatedTaskLocally);
    }

    try {
        const res = await axios.put(`/api/tasks/${taskId}`, updatedData, tokenConfig());
        const updatedTaskFromServer = res.data;

        setAllTasks(prevTasks => prevTasks.map(task => 
            task._id === taskId ? updatedTaskFromServer : task
        ));
        
        if (selectedTask && selectedTask._id === taskId) {
            setSelectedTask(updatedTaskFromServer);
        }
        
    } catch (err) {
        toast.error(err.response?.data?.msg || 'Lỗi khi cập nhật công việc');
        setAllTasks(originalTasks);
        if (selectedTask && selectedTask._id === taskId) {
            setSelectedTask(originalTasks.find(t => t._id === taskId));
        }
    }
};
    
    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Bạn có chắc muốn xóa công việc này?')) {
            try {
                await axios.delete(`/api/tasks/${taskId}`, tokenConfig());
                setAllTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
                setSelectedTask(null); 
                toast.success('Đã xóa công việc');
            } catch (err) {
                toast.error('Lỗi khi xóa công việc');
            }
        }
    };

    const handleAddSubtask = async (taskId, title) => {
        try {
            const res = await axios.post(`/api/tasks/${taskId}/subtasks`, { title }, tokenConfig());
            handleUpdateLocalState(taskId, res.data);
            toast.success('Đã thêm việc con');
        } catch (err) { toast.error('Lỗi khi thêm việc con'); }
    };
    
    const handleToggleSubtask = async (taskId, subtaskId) => {
        try {
            const res = await axios.put(`/api/tasks/${taskId}/subtasks/${subtaskId}`, null, tokenConfig());
            handleUpdateLocalState(taskId, res.data);
        } catch (err) { toast.error('Lỗi khi cập nhật việc con'); }
    };

    const handleAddTask = async () => {
        const title = prompt("Nhập tiêu đề công việc mới:");
        if (title) {
            try {
                const res = await axios.post('/api/tasks', { title }, tokenConfig());
                setAllTasks(prevTasks => [res.data, ...prevTasks]);
                setSelectedTask(res.data); 
                toast.success('Đã tạo công việc mới');
            } catch (err) {
                toast.error('Lỗi khi tạo công việc');
            }
        }
    };

    const handleUpdateLocalState = (taskId, updatedTask) => {
        setAllTasks(prevTasks => prevTasks.map(task => (task._id === taskId ? updatedTask : task)));
        if (selectedTask && selectedTask._id === taskId) {
            setSelectedTask(updatedTask);
        }
    };
    
    return (
        <div className="container todo-page-layout">
            <div className="todo-sidebar">
                <ul>
                    <li className={activeFilter === 'today' ? 'active' : ''} onClick={() => setActiveFilter('today')}>Ngày của tôi</li>
                    <li className={activeFilter === 'important' ? 'active' : ''} onClick={() => setActiveFilter('important')}>Quan trọng</li>
                    <li className={activeFilter === 'all' ? 'active' : ''} onClick={() => setActiveFilter('all')}>Tất cả công việc</li>
                </ul>
                <button className="btn btn-primary" style={{width: '100%', marginTop: '1rem'}} onClick={handleAddTask}>Thêm công việc</button>
            </div>

            <div className="task-list-container">
                {loading ? <p>Đang tải...</p> : filteredTasks.map(task => (
                    <TaskItem 
                        key={task._id} 
                        task={task} 
                        onSelectTask={setSelectedTask} 
                        onToggleStatus={handleUpdateTask}
                        isSelected={selectedTask?._id === task._id}
                    />
                ))}
            </div>

            <TaskDetail 
                task={selectedTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onAddSubtask={handleAddSubtask}
                onToggleSubtask={handleToggleSubtask}
                onClose={() => setSelectedTask(null)}
            />
        </div>
    );
};

export default TodoPage;