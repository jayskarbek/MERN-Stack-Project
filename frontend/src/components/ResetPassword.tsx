import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/background.jpeg';
import 'bootstrap/dist/css/bootstrap.min.css';
import { buildApiUrl } from '../utils/api';
import './Login.css'; 

const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const email = searchParams.get('email');
    const token = searchParams.get('token');

    useEffect(() => {
        if (!email || !token) {
            setError('Invalid or missing reset link.');
        }
    }, [email, token]);

    async function passReset(event: React.FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        
        if (!password || !confirmPassword) {
            setError('Please fill out both password fields.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess('');

        try { 
            const response = await fetch(buildApiUrl('resetpass'), {
                method: 'POST',
                body: JSON.stringify({ email, token, newPassword: password }),
                headers: { 'Content-Type': 'application/json' },
            });

            const res = await response.json();

            if (!response.ok) {
                setError(res.error || 'Failed to reset password.');
                setIsLoading(false);
                return;
            }

            setSuccess('Password has been reset successfully!');
            console.log('Reset Password Success:', res);
            
            setTimeout(() => navigate('/login'), 2000);
            
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Error connecting to the server');
        } finally {
            setIsLoading(false);
        }
    }

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
        position: 'relative',
        padding: '20px',
    };

    const formContainerStyle: React.CSSProperties = {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
    };

    const inputStyle: React.CSSProperties = {
        fontSize: '20px',
        width: '100%',
        borderRadius: '14px',
        backgroundColor: '#fff',
        color: '#000',
        border: '2px solid #e0e0e0',
        textAlign: 'center',
        padding: '12px 16px',
        marginBottom: '16px',
        transition: 'border-color 0.3s',
        outline: 'none',
    };

    const buttonStyle: React.CSSProperties = {
        fontSize: '20px',
        borderRadius: '14px',
        width: '70%',
        margin: '0 auto',
        display: 'block',
        backgroundColor: '#2c5f2d',
        color: 'white',
        fontWeight: 600,
        padding: '12px',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        opacity: isLoading ? 0.7 : 1,
        border: 'none',
        transition: 'all 0.3s',
    };

    return (
        <div style={backgroundStyle}>
            <div style={formContainerStyle}>
                <h2 style={{
                    fontSize: '30px',
                    fontWeight: 'bold',
                    color: '#2c5f2d',
                    marginBottom: '20px',
                }}>
                    Reset Password
                </h2>

                <form onSubmit={passReset}>
                    <input
                        type="password"
                        placeholder="New Password"
                        style={inputStyle}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onFocus={(e) => e.target.style.borderColor = '#2c5f2d'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                        disabled={isLoading}
                    />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        style={inputStyle}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        onFocus={(e) => e.target.style.borderColor = '#2c5f2d'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                        disabled={isLoading}
                    />

                    {error && (
                        <div style={{ 
                            fontSize: '14px', 
                            color: '#dc3545',
                            marginBottom: '12px',
                            padding: '10px',
                            backgroundColor: '#ffe6e6',
                            borderRadius: '8px',
                        }}>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div style={{
                            fontSize: '14px',  
                            color: '#28a745',
                            marginBottom: '12px',
                            padding: '10px',
                            backgroundColor: '#e6ffe6',
                            borderRadius: '8px',
                        }}>
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        style={buttonStyle}
                        onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#234d23')}
                        onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#2c5f2d')}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Updating...' : 'Reset Password'}
                    </button>
                </form>

                <div style={{
                    marginTop: '20px',
                    fontSize: '15px',
                    color: '#2c5f2d',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                }}
                onClick={() => !isLoading && navigate('/login')}>
                    Return to Login
                </div>
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

export default ResetPassword;
