import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/background.jpeg';
import 'bootstrap/dist/css/bootstrap.min.css';

const VerifyEmail: React.FC = () => { 

    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => navigate('login'), 3000);
        return () => clearTimeout(timer);
    }, [navigate]);

    const backgroundStyle: React.CSSProperties = {
        backgroundImage: `url(${backgroundImage})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundColor: 'rgb(210, 182, 147)',
        height: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    };

    const box: React.CSSProperties = {
        padding: '15px',
        width: '30%',
        height: '15%',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '20px', 
    };

  return (
    <div style={backgroundStyle}>
        <div style={box}>
        <h1 
            style={{ 
                fontSize: '2.25rem', 
                marginBottom: '1rem' 
                }}>
            Account Verified!</h1>

        <p 
            style={{ 
                fontSize: '1.25rem' 
                }}>
            Redirecting to login...</p>
        
        <div
            style={{
            position: 'absolute',
            bottom: '8px',
            right: '12px',
            color: 'rgba(255,255,255,0.85)',
            fontSize: '12px',
            textAlign: 'right',
            fontStyle: 'italic',
            }}
        >
            Photo from Getty Images
            </div>
        </div>
    </div>
    );
};

export default VerifyEmail;