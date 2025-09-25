// client/src/pages/CalendarPage.js
import React, { useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const CalendarPage = () => {

    const tokenConfig = useCallback(() => {
        const token = localStorage.getItem('token');
        return { 
            headers: { 'x-auth-token': token },
        };
    }, []);

    const handleFetchEvents = (fetchInfo, successCallback, failureCallback) => {
        console.log("FullCalendar is fetching events for:", fetchInfo);
        
        const params = {
            start: fetchInfo.startStr,
            end: fetchInfo.endStr,
        };

        axios.get('/api/calendar', { ...tokenConfig(), params: params })
            .then(res => {
                console.log("Events received from server:", res.data);
                successCallback(res.data);
            })
            .catch(err => {
                console.error("LỖI KHI TẢI DỮ LIỆU LỊCH (chi tiết):", err.response || err);
                toast.error('Không thể tải dữ liệu lịch.');
                failureCallback(err);
            });
    };

    return (
        <div className="container">
            <Link to="/" className="btn" style={{marginBottom: '1rem'}}>&larr; Quay lại Trang Chủ</Link>
            <h1>Lịch Công Việc</h1>
            <div className="card" style={{padding: '2rem'}}>
                <FullCalendar
                    plugins={[dayGridPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,dayGridWeek'
                    }}
                    events={handleFetchEvents}
                    height="75vh"
                    locale="vi"
                    buttonText={{
                        today:    'Hôm nay',
                        month:    'Tháng',
                        week:     'Tuần',
                    }}
                />
            </div>
        </div>
    );
};

export default CalendarPage;