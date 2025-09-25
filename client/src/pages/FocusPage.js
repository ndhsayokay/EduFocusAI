// client/src/pages/FocusPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import StudyInterface from '../components/StudyInterface';

const FocusPage = () => {
    return (
        <div className="container" style={{ maxWidth: '800px', margin: 'auto', textAlign: 'center' }}>
            <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                <Link to="/" className="btn">&larr; Quay lại Dashboard</Link>
            </div>
            
            <h1>Phiên Học Tập Trung</h1>
            <p>Hãy tập trung vào công việc của bạn. Chúng tôi sẽ theo dõi và giúp bạn duy trì sự tập trung.</p>

            <StudyInterface />
        </div>
    );
};

export default FocusPage;