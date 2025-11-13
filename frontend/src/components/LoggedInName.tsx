import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../utils/auth';

const LoggedInName: React.FC = () => {
    const navigate = useNavigate();
    
    const userName = auth.getUserName();

    function doLogout(event: React.MouseEvent<HTMLButtonElement>): void {
        event.preventDefault();
        auth.logout();
        navigate('/');
    }

    function returnToHomePage(event: React.MouseEvent<HTMLButtonElement>): void {
        event.preventDefault();
        navigate('/CardPage');
    }

    return (
        <header
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px 30px',
                backgroundColor: '#0f3b04',
                color: 'white',
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                zIndex: 1000,
                height: '70px',
                boxSizing: 'border-box',
            }}
        >
            <div style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600',
                letterSpacing: '0.3px'
            }}>
                Welcome, {userName}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
                <button
                    type="button"
                    style={{
                        backgroundColor: 'transparent',
                        color: 'white',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '8px',
                        padding: '8px 20px',
                        fontSize: '15px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.borderColor = 'white';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    }}
                    onClick={returnToHomePage}
                >
                    Home
                </button>

                <button
                    type="button"
                    style={{
                        backgroundColor: 'rgba(220, 53, 69, 0.9)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 20px',
                        fontSize: '15px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#c82333';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.9)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                    onClick={doLogout}
                >
                    Log Out
                </button>
            </div>
        </header>
    );
};

export default LoggedInName;