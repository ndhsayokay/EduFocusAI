import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { Link } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement);

const ReportPage = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'x-auth-token': token } };

        const [summaryRes, historyRes] = await Promise.all([
          axios.get('http://localhost:5000/api/reports/summary', config),
          axios.get('http://localhost:5000/api/reports/history', config),
        ]);

        setSummaryData(summaryRes.data);
        setHistoryData(historyRes.data);
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu báo cáo', err);
      } finally {
        setLoading(false); 
      }
    };

    fetchReportData();
  }, []);

  const chartData = {
    labels: historyData?.map(item => item.date) || [],
    datasets: [
      {
        label: 'Thời gian học (phút)',
        data: historyData?.map(item => item.duration) || [],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'y', 
      },
      {
        label: 'Điểm tập trung trung bình',
        data: historyData?.map(item => item.averageFocus) || [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    interaction: {
        mode: 'index',
        intersect: false,
    },
    plugins: {
        title: {
            display: true,
            text: 'Lịch Sử Học Tập Theo Thời Gian',
        },
    },
    scales: {
        y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
                display: true,
                text: 'Phút'
            }
        },
        y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
                display: true,
                text: 'Điểm'
            },
            grid: {
                drawOnChartArea: false,
            },
        },
    },
  };

  if (loading) {
    return <div>Đang tải dữ liệu báo cáo...</div>;
  }

  return (
    <div style={{ padding: '1rem 2rem' }}>
        <Link to="/">&larr; Quay lại Trang Chủ</Link>
        <h1>Báo Cáo Học Tập</h1>
      
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            <div style={cardStyle}>
                <h4>Tổng số phiên học</h4>
                <p style={statStyle}>{summaryData?.totalSessions || 0}</p>
            </div>
            <div style={cardStyle}>
                <h4>Tổng giờ đã học</h4>
                <p style={statStyle}>{summaryData?.totalHoursStudied || 0}</p>
            </div>
            <div style={cardStyle}>
                <h4>Điểm tập trung TB</h4>
                <p style={statStyle}>{summaryData?.overallAverageFocus || 0}</p>
            </div>
            <div style={cardStyle}>
                <h4>Công việc hoàn thành</h4>
                <p style={statStyle}>{summaryData?.completedTasks || 0}</p>
            </div>
        </div>

        {/* Phần biểu đồ */}
        <div>
            {historyData && historyData.length > 0 ? (
                <Line options={chartOptions} data={chartData} />
            ) : (
                <p>Chưa có dữ liệu lịch sử để hiển thị biểu đồ.</p>
            )}
        </div>
    </div>
  );
};

const cardStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1rem',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const statStyle = {
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: '0.5rem 0 0 0'
};

export default ReportPage;