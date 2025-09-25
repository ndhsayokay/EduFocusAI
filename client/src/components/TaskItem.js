// client/src/components/TaskItem.js
import React from 'react';
import { format, isPast, isToday } from 'date-fns';

const TaskItem = ({ task, onSelectTask, onToggleStatus, isSelected }) => {
  const handleStatusToggle = (e) => {
    e.stopPropagation();
    onToggleStatus(task._id, { status: task.status === 'todo' ? 'completed' : 'todo' });
  };

  const getDateColor = (dueDate) => {
    const date = new Date(dueDate);
    if (isPast(date) && !isToday(date)) {
      return 'red'; // Quá hạn
    }
    if (isToday(date)) {
      return 'orange'; // Hôm nay
    }
    return 'inherit'; // Mặc định
  };

  return (
    <div 
      className={`task-item ${isSelected ? 'selected' : ''}`} 
      onClick={() => onSelectTask(task)}
    >
      <input
        type="checkbox"
        className="task-item-checkbox"
        checked={task.status === 'completed'}
        onChange={handleStatusToggle}
      />
      <div className="task-item-content">
        <div className="task-item-title-row">
            <span className={`priority-indicator priority-${task.priority}`}></span>
            <p className={`task-item-title ${task.status === 'completed' ? 'completed' : ''}`} style={{ margin: 0 }}>
              {task.title}
            </p>
        </div>
        
        {task.description && <p className="task-item-description">{task.description}</p>}
        
        <div className="task-item-meta">
          {task.dueDate && 
            <span style={{ color: getDateColor(task.dueDate) }}>
                Hạn: {format(new Date(task.dueDate), 'dd/MM/yyyy')}
            </span>
          }
          {task.subtasks?.length > 0 && 
            <span>
                {task.subtasks.filter(st => st.isCompleted).length}/{task.subtasks.length}
            </span>
          }
        </div>
      </div>
    </div>
  );
};

export default TaskItem;