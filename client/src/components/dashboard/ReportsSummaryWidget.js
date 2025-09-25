import React from 'react';
import { Link } from 'react-router-dom';

const ReportsSummaryWidget = ({ summary }) => {
  if (!summary) return <div className="widget widget-reports"><p>Đang tải tóm tắt...</p></div>;

  return (
    <div className="widget widget-reports">
      <div className="widget-header">
        <h3>Tóm Tắt</h3>
        <Link to="/reports">Chi tiết</Link>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'center' }}>
        <div>
          <h4>{summary.totalHoursStudied}</h4>
          <p>Giờ học</p>
        </div>
        <div>
          <h4>{summary.overallAverageFocus}</h4>
          <p>Điểm tập trung</p>
        </div>
        <div>
          <h4>{summary.completedTasks}</h4>
          <p>Việc hoàn thành</p>
        </div>
         <div>
          <h4>{summary.totalSessions}</h4>
          <p>Phiên học</p>
        </div>
      </div>
    </div>
  );
};
export default ReportsSummaryWidget;