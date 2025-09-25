import React from 'react';
import { Link } from 'react-router-dom';
import TaskItem from '../TaskItem'; // Tái sử dụng TaskItem

const MyDayWidget = ({ tasks, onToggleStatus }) => {
  // Lọc ra các task cho "Ngày của tôi": chưa hoàn thành và quá hạn, hoặc có hạn hôm nay
  const myDayTasks = tasks
    .filter(task => task.status === 'todo')
    .slice(0, 5); // Chỉ hiển thị 5 task

  return (
    <div className="widget widget-myday">
      <div className="widget-header">
        <h3>Công việc hôm nay</h3>
        <Link to="/todo">Xem tất cả</Link>
      </div>
      <div>
        {myDayTasks.length > 0 ? (
          myDayTasks.map(task => (
            <TaskItem key={task._id} task={task} onToggleStatus={onToggleStatus} onSelectTask={() => {}} />
          ))
        ) : (
          <p>Tuyệt vời! Không có công việc nào cho hôm nay.</p>
        )}
      </div>
    </div>
  );
};
export default MyDayWidget;