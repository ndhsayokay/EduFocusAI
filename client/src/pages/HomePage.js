// client/src/pages/HomePage.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Import các widget
import WelcomeWidget from '../components/dashboard/WelcomeWidget';
import MyDayWidget from '../components/dashboard/MyDayWidget';
import ReportsSummaryWidget from '../components/dashboard/ReportsSummaryWidget';
import ProgressWidget from '../components/dashboard/ProgressWidget';
// Bạn có thể tạo thêm widget cho bạn bè, lịch...

const HomePage = () => {
    const [dashboardData, setDashboardData] = useState({
        tasks: [],
        summary: null,
        gamification: null,
    });
    const [loading, setLoading] = useState(true);

    const tokenConfig = useCallback(() => {
        const token = localStorage.getItem('token');
        return { headers: { 'x-auth-token': token } };
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [tasksRes, summaryRes, userRes] = await Promise.all([
                    axios.get('/api/tasks', tokenConfig()),
                    axios.get('/api/reports/summary', tokenConfig()),
                    axios.get('/api/auth/me', tokenConfig()) 
                ]);

                setDashboardData({
                    tasks: tasksRes.data,
                    summary: summaryRes.data,
                    gamification: userRes.data.gamification,
                });
            } catch (err) {
                toast.error('Không thể tải dữ liệu cho dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [tokenConfig]);

    const handleToggleStatus = async (taskId, updatedData) => {
        try {
            const res = await axios.put(`/api/tasks/${taskId}`, updatedData, tokenConfig());
            setDashboardData(prevData => ({
                ...prevData,
                tasks: prevData.tasks.map(t => t._id === taskId ? res.data : t)
            }));
        } catch (err) {
            toast.error('Lỗi khi cập nhật công việc');
        }
    };
    
    if (loading) {
        return <div className="container"><p>Đang tải dashboard...</p></div>;
    }

    return (
        <div className="container">
            <div className="dashboard-grid">
                <WelcomeWidget />
                <ProgressWidget gamificationData={dashboardData.gamification} />
                <MyDayWidget tasks={dashboardData.tasks} onToggleStatus={handleToggleStatus} />
                <ReportsSummaryWidget summary={dashboardData.summary} />
            </div>
        </div>
    );
};

export default HomePage;