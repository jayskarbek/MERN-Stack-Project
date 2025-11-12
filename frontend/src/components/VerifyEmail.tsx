import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/background.jpeg';
import 'bootstrap/dist/css/bootstrap.min.css';

const VerifyEmail: React.FC = () => { 
    const navigate = useNavigate();
    
    useEffect(() => {
        const timer = setTimeout(() => navigate('/login'), 3000);
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
        padding: '20px',
    };
    
    const boxStyle: React.CSSProperties = {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '450px',
        width: '100%',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
    };
    
    return (
        <div style={backgroundStyle}>
            <div style={boxStyle}>
                <h1 style={{ 
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#2c5f2d',
                    marginBottom: '16px',
                    marginTop: '0'
                }}>
                    Account Verified!
                </h1>
                
                <p style={{ 
                    fontSize: '16px',
                    color: '#666',
                    marginBottom: '24px'
                }}>
                    Your email has been successfully verified. Redirecting to login...
                </p>

                <button
                    onClick={() => navigate('/login')}
                    style={{
                        fontSize: '16px',
                        fontWeight: '500',
                        padding: '12px 24px',
                        width: '100%',
                        backgroundColor: 'transparent',
                        color: '#2c5f2d',
                        border: '2px solid #2c5f2d',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#2c5f2d';
                        e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#2c5f2d';
                    }}
                >
                    Go to Login
                </button>
            </div>
            
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
    );
};

export default VerifyEmail;