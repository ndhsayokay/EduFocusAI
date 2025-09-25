// client/src/components/TaskDetail.js
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const TaskDetail = ({ task, onUpdateTask, onDeleteTask, onAddSubtask, onToggleSubtask, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

    useEffect(() => {
        if (task) {
            setTitle(task.title || '');
            setDescription(task.description || '');
        }
    }, [task]);

    if (!task) {
        return (
            <div className="task-detail-container">
                <h3>Chọn hoặc tạo một công việc để xem chi tiết</h3>
            </div>
        );
    }
    
    const handleBlurUpdate = (field, value) => {
    if (task[field] !== value) {
        onUpdateTask(task._id, { [field]: value });
    }
};
    const handleImmediateUpdate = (field, value) => {
    onUpdateTask(task._id, { [field]: value });
};
    const handleDateChange = (date) => {
        onUpdateTask(task._id, { dueDate: date });
    };

    const handlePriorityChange = (e) => {
        onUpdateTask(task._id, { priority: e.target.value });
    };

    const handleAddSubtask = (e) => {
        e.preventDefault();
        if (newSubtaskTitle.trim()) {
            onAddSubtask(task._id, newSubtaskTitle);
            setNewSubtaskTitle('');
        }
    };
    
    return (
        <div className="task-detail-container task-detail-form">
            <button onClick={onClose} style={{ float: 'right', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.5rem' }}>×</button>

            <div className="form-group">
                <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    onBlur={() => handleBlurUpdate('title', title)} 
                    className="form-control" 
                />
            </div>
            <div className="form-group">
                <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    onBlur={() => handleBlurUpdate('description', description)} 
                    className="form-control" 
                    placeholder="Thêm mô tả..." 
                />
            </div>
            <div className="form-group">
                <label>Ngày hết hạn:</label>
                <DatePicker 
                    selected={task.dueDate ? new Date(task.dueDate) : null} 
                    onChange={(date) => handleImmediateUpdate('dueDate', date)} 
                    className="form-control" 
                    placeholderText="Chọn ngày"
                />
            </div>
            <div className="form-group">
                <label>Độ ưu tiên:</label>
                <select 
                    name="priority" 
                    value={task.priority} 
                    onChange={(e) => handleImmediateUpdate('priority', e.target.value)}
                    className="form-control"
                >
                    <option value="low">Thấp</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Cao</option>
                </select>
            </div>
            
            <div className="subtask-list">
                <h4>Công việc con</h4>
                {task.subtasks && task.subtasks.map(subtask => (
                    <div key={subtask._id} className="subtask-item">
                        <input type="checkbox" checked={subtask.isCompleted} onChange={() => onToggleSubtask(task._id, subtask._id)} />
                        <span style={{textDecoration: subtask.isCompleted ? 'line-through' : 'none'}}>{subtask.title}</span>
                    </div>
                ))}
                <form onSubmit={handleAddSubtask} style={{display: 'flex', marginTop: '0.5rem'}}>
                    <input type="text" value={newSubtaskTitle} onChange={(e) => setNewSubtaskTitle(e.target.value)} className="form-control" placeholder="Thêm việc con..."/>
                    <button type="submit" className="btn btn-primary">+</button>
                </form>
            </div>

            <hr />
            <button onClick={() => onDeleteTask(task._id)} className="btn btn-danger">Xóa công việc</button>
        </div>
    );
};

export default TaskDetail;