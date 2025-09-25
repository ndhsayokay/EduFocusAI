import React, { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 

const StudyInterface = () => {
  const [focusScore, setFocusScore] = useState(null);
  const [statusText, setStatusText] = useState('Chưa bắt đầu');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const { user } = useAuth();

  const [sessionData, setSessionData] = useState({
    startTime: null,
    focusData: [],
  });

  const webcamRef = useRef(null);
  const intervalRef = useRef(null);

  const captureAndAnalyze = useCallback(async () => {
    if (webcamRef.current && user) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        try {
          const fetchRes = await fetch(imageSrc);
          const blob = await fetchRes.blob();
          
          const formData = new FormData();
          formData.append('file', blob, 'webcam-capture.jpg');
          formData.append('user_id', user.id); 

          const res = await axios.post('http://localhost:8000/analyze', formData);

          setFocusScore(res.data.focus_score);
          setStatusText(res.data.status);
          
          setSessionData(prevData => ({
            ...prevData,
            focusData: [...prevData.focusData, { timestamp: new Date(), score: res.data.focus_score }]
          }));

        } catch (error) {
          console.error("Lỗi khi gọi AI service:", error);
          setStatusText("Lỗi kết nối AI");
        }
      }
    }
  }, [user]);

  const startSession = () => {
    setIsSessionActive(true);
    setStatusText('Đang phân tích...');
    setSessionData({
      startTime: new Date(),
      focusData: [],
    });
    intervalRef.current = setInterval(captureAndAnalyze, 2000);
  };

  const stopSession = async () => {
    setIsSessionActive(false);
    setStatusText('Đang lưu...');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      };

      const body = JSON.stringify({
        startTime: sessionData.startTime,
        endTime: new Date(),
        focusData: sessionData.focusData,
      });

      await axios.post('http://localhost:5000/api/sessions', body, config);
      
      setStatusText('Đã lưu phiên học thành công!');

    } catch (err) {
      console.error('Lỗi khi lưu phiên học:', err.response.data);
      setStatusText('Lỗi! Không thể lưu phiên học.');
    }
    setFocusScore(null);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="card"> {/* Sử dụng class 'card' cho giao diện đẹp hơn */}
      <h3 style={{textAlign: 'center'}}>Giao Diện Học Tập</h3>
      
      <div style={{display: 'flex', justifyContent: 'center', marginBottom: '1rem'}}>
          <Webcam
            ref={webcamRef}
            audio={false}
            height={240}
            width={320}
            screenshotFormat="image/jpeg"
            style={{borderRadius: 'var(--border-radius)'}}
          />
      </div>


      <div style={{textAlign: 'center'}}>
        <h3>
          Điểm tập trung: 
          <span style={{ color: focusScore !== null && focusScore > 50 ? 'var(--success-color)' : 'var(--danger-color)', fontWeight: 'bold' }}>
             {focusScore !== null ? ` ${focusScore}` : ' N/A'}
          </span>
        </h3>
        <p>Trạng thái: {statusText}</p>
      </div>
      
      <div style={{textAlign: 'center', marginTop: '1rem'}}>
        {!isSessionActive ? (
          <button onClick={startSession} className="btn btn-primary">Bắt đầu phiên học</button>
        ) : (
          <button onClick={stopSession} className="btn btn-danger">
            Kết thúc
          </button>
        )}
      </div>
    </div>
  );
};

export default StudyInterface;