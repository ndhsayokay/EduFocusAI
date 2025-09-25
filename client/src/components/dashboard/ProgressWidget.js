import React from 'react';

const ProgressWidget = ({ gamificationData }) => {
  if (!gamificationData) return <div className="widget widget-progress"><p>Đang tải tiến trình...</p></div>;
  
  const { level, xp, xpToNextLevel, virtualPet } = gamificationData;
  const xpPercentage = (xp / xpToNextLevel) * 100;
  const petImageSrc = `/pets/pet-${virtualPet.status}.png`;

  return (
    <div className="widget widget-progress">
       <div style={{display: 'flex', gap: '1.5rem', alignItems: 'center'}}>
            <img src={petImageSrc} alt="Thú ảo" style={{ width: '80px', height: '80px' }} />
            <div style={{flexGrow: 1}}>
                <p><strong>Cấp độ: {level}</strong> ({Math.round(xp)} / {xpToNextLevel} XP)</p>
                <div className="progress-bar">
                    <div className="progress-bar-inner" style={{ width: `${xpPercentage}%` }}>
                        {Math.round(xpPercentage)}%
                    </div>
                </div>
            </div>
       </div>
    </div>
  );
};
export default ProgressWidget;