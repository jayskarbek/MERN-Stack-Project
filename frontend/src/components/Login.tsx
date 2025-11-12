import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/background.jpeg';
import 'bootstrap/dist/css/bootstrap.min.css';
import { buildApiUrl } from '../utils/api';
import './Login.css';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    async function doLogin(event: React.FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        
        if (!email || !password) {
            setError("Please fill out all forms");
            return;
        }

        setIsLoading(true);
        setError('');

        try { 
            const response = await fetch(buildApiUrl('login'), {
                method: 'POST',
                body: JSON.stringify({ email, password }),
                headers: { 'Content-Type': 'application/json' },
            });

            const res = await response.json();

            if (!response.ok) {
                setError(res.error || 'Invalid username or password');
                setIsLoading(false);
                return;
            }

            // Login successful - Store JWT token and user info
            localStorage.setItem('token', res.token);
            localStorage.setItem('userId', res.id);
            localStorage.setItem('firstName', res.firstName);
            localStorage.setItem('lastName', res.lastName);

            console.log('Login successful:', res);
            
            navigate('/CardPage');
            
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Error connecting to the Server');
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
        position: 'relative',
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
                    marginBottom: '30px',
                    textAlign: 'center',
                    marginTop: '0'
                }}>
                    Welcome Back
                </h2>

                <form onSubmit={doLogin}>
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

                    <input
                        type="password"
                        placeholder="Password"
                        style={inputStyle}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onFocus={(e) => e.target.style.borderColor = '#2c5f2d'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                        disabled={isLoading}
                    />

                    <div style={{ 
                        textAlign: 'right', 
                        marginBottom: '20px',
                        marginTop: '-8px'
                    }}>
                        <span
                            onClick={() => !isLoading && navigate('/forgotpass')}
                            style={{
                                color: '#2c5f2d',
                                fontSize: '14px',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.5 : 1,
                                textDecoration: 'none',
                                fontWeight: '500'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                        >
                            Forgot Password?
                        </span>
                    </div>

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
                            marginBottom: '16px',
                            opacity: isLoading ? 0.7 : 1
                        }}
                        disabled={isLoading}
                        onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#234d23')}
                        onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#2c5f2d')}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>

                    <div style={{ 
                        textAlign: 'center',
                        fontSize: '15px',
                        color: '#666'
                    }}>
                        Don't have an account?{' '}
                        <span
                            onClick={() => !isLoading && navigate('/register')}
                            style={{
                                color: '#2c5f2d',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                fontWeight: '600',
                                opacity: isLoading ? 0.5 : 1
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                        >
                            Sign up
                        </span>
                    </div>
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

export default Login;