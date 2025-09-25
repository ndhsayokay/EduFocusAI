import React from 'react';
import { useAuth } from '../../context/AuthContext';

const WelcomeWidget = () => {
  const { user } = useAuth();
  return (
    <div className="widget widget-welcome">
      <h2>Xin chào, {user ? user.email : 'bạn'}!</h2>
      <p>Chúc bạn có một ngày học tập và làm việc hiệu quả.</p>
    </div>
  );
};
export default WelcomeWidget;