import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../utils/auth';

const LoggedInName: React.FC = () => {
    const navigate = useNavigate();
    
    // Get user name from auth utility
    const userName = auth.getUserName();

    function doLogout(event: React.MouseEvent<HTMLButtonElement>): void {
        event.preventDefault();
        
        // Clear authentication data using auth utility
        auth.logout();
        
        // Redirect to login page
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
                padding: '10px 20px',
                backgroundColor: '#0f3b04',
                color: 'white',
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
                height: '60px',
                boxSizing: 'border-box',
            }}
        >
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                Welcome, {userName}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    type="button"
                    style={{
                        backgroundColor: '#d9534f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        padding: '10px 20px',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#c9302c')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#d9534f')}
                    onClick={returnToHomePage}
                >
                    Home
                </button>

                <button
                    type="button"
                    style={{
                        backgroundColor: '#d9534f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        padding: '10px 20px',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#c9302c')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#d9534f')}
                    onClick={doLogout}
                >
                    Log Out
                </button>
            </div>
        </header>
    );
};

export default LoggedInName;