// client/src/App.js
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React from 'react';

// === 1. IMPORT CÁC COMPONENT LAYOUT MỚI ===
import MainLayout from './components/MainLayout';
import PrivateRoute from './components/PrivateRoute';
// ===========================================

// === 2. IMPORT TẤT CẢ CÁC TRANG CỦA BẠN ===
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ReportPage from './pages/ReportPage';
import FriendsPage from './pages/FriendsPage';
import StudyRoomsListPage from './pages/StudyRoomsListPage';
import StudyRoomPage from './pages/StudyRoomPage'; 
import LeaderboardPage from './pages/LeaderboardPage';
import TodoPage from './pages/TodoPage';
import CalendarPage from './pages/CalendarPage'; 
import FocusPage from './pages/FocusPage';

// === 3. IMPORT CÁC THƯ VIỆN TIỆN ÍCH ===
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'; 

function App() {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route 
          path="/*"
          element={
            <PrivateRoute>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/focus" element={<FocusPage />} />
                  <Route path="/todo" element={<TodoPage />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/reports" element={<ReportPage />} />
                  <Route path="/rooms" element={<StudyRoomsListPage />} />
                  <Route path="/rooms/:id" element={<StudyRoomPage />} />
                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                  <Route path="/friends" element={<FriendsPage />} />
                </Routes>
              </MainLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;