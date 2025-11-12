import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/background.jpeg';
import 'bootstrap/dist/css/bootstrap.min.css';
import { buildApiUrl } from '../utils/api';
import './ForgotPassword.css';

const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    async function doForgotPass(event: React.FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        
        if (!email) {
            setError("Please enter your email");
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(buildApiUrl('forgotpass'), {
                method: 'POST',
                body: JSON.stringify({ email }),
                headers: { 'Content-Type': 'application/json' },
            });

            const res = await response.json();

            if (!response.ok) {
                setError(res.error);
                setIsLoading(false);
                return;
            }

            setSuccess('Password reset link sent to your email!');
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
        padding: '20px',
    };

    const formContainerStyle: React.CSSProperties = {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    };

    const inputStyle: React.CSSProperties = {
        fontSize: '16px',
        padding: '12px 20px',
        width: '100%',
        borderRadius: '12px',
        border: '2px solid #e0e0e0',
        backgroundColor: '#fff',
        transition: 'border-color 0.3s',
        marginBottom: '16px',
        outline: 'none',
    };

    return (
        <div style={backgroundStyle}>
            <div style={formContainerStyle}>
                <h2 style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#2c5f2d',
                    marginBottom: '12px',
                    textAlign: 'center',
                    marginTop: '0'
                }}>
                    Reset Password
                </h2>
                
                <p style={{
                    fontSize: '14px',
                    color: '#666',
                    textAlign: 'center',
                    marginBottom: '30px'
                }}>
                    Enter your email and we'll send you a link to reset your password
                </p>

                <form onSubmit={doForgotPass}>
                    <input
                        type="email"
                        placeholder="Email address"
                        style={inputStyle}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onFocus={(e) => e.target.style.borderColor = '#2c5f2d'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                        disabled={isLoading}
                    />

                    {error && 
                        <div style={{ 
                            fontSize: '14px', 
                            color: '#dc3545',
                            marginBottom: '16px',
                            padding: '10px',
                            backgroundColor: '#ffe6e6',
                            borderRadius: '8px',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    }

                    {success && 
                        <div style={{
                            fontSize: '14px',  
                            color: '#28a745',
                            marginBottom: '16px',
                            padding: '10px',
                            backgroundColor: '#e6ffe6',
                            borderRadius: '8px',
                            textAlign: 'center'
                        }}>
                            {success}
                        </div>
                    }

                    <button
                        type="submit"
                        style={{ 
                            fontSize: '18px',
                            fontWeight: '600',
                            borderRadius: '12px',
                            width: '100%',
                            padding: '14px',
                            border: 'none',
                            backgroundColor: '#2c5f2d',
                            color: 'white',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s',
                            marginBottom: '12px',
                            opacity: isLoading ? 0.7 : 1
                        }}
                        disabled={isLoading}
                        onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#234d23')}
                        onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#2c5f2d')}
                    >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        style={{
                            fontSize: '16px',
                            fontWeight: '500',
                            padding: '12px',
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
                        Back to Login
                    </button>
                </form>
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

export default ForgotPassword;