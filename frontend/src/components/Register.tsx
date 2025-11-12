import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/background.jpeg';
import 'bootstrap/dist/css/bootstrap.min.css';
import { buildApiUrl } from '../utils/api';
import './Register.css';

const Register: React.FC = () => { 
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    async function doRegister(event: React.FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        
        if (!email || !password || !firstName || !lastName) {
            setError("Please fill out all forms");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const response = await fetch(buildApiUrl('register'), {
                method: 'POST',
                body: JSON.stringify({ email, password, firstName, lastName }),
                headers: { 'Content-Type': 'application/json' },
            });

            const res = await response.json();

            if (!response.ok) {
                setError(res.error);
                setSuccess('');
                return;
            }

            setError('');
            setSuccess('Registration Successful! Please check your email to verify your account! ');
            console.log('Registered user:', res.user);

            setTimeout(() => navigate('/login'), 3000);

        } catch (err) {
            console.error('Fetch error:', err);
            setError('Error connecting to the server');
            setSuccess('');
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
        padding: '30px 40px',
        maxWidth: '450px',
        width: '100%',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        maxHeight: '90vh',
        overflowY: 'auto',
    };

    const inputStyle: React.CSSProperties = {
        fontSize: '16px',
        padding: '12px 20px',
        width: '100%',
        borderRadius: '12px',
        border: '2px solid #e0e0e0',
        backgroundColor: '#fff',
        transition: 'border-color 0.3s',
        marginBottom: '12px',
        outline: 'none',
    };

  return (
    <div style={backgroundStyle}>
        <div style={formContainerStyle}>
            <h2 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#2c5f2d',
                marginBottom: '25px',
                textAlign: 'center',
                marginTop: '0'
            }}>
                Create Account
            </h2>

            <form onSubmit={doRegister}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                    <input
                        type="text"
                        placeholder="First name"
                        style={{
                            ...inputStyle,
                            width: '50%',
                            marginBottom: '0'
                        }}
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        onFocus={(e) => e.target.style.borderColor = '#2c5f2d'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                    />
                    <input
                        type="text"
                        placeholder="Last name"
                        style={{
                            ...inputStyle,
                            width: '50%',
                            marginBottom: '0'
                        }}
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        onFocus={(e) => e.target.style.borderColor = '#2c5f2d'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                    />
                </div>

                <input
                    type="email"
                    placeholder="Email address"
                    style={inputStyle}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={(e) => e.target.style.borderColor = '#2c5f2d'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />

                <input
                    type="password"
                    placeholder="Password"
                    style={inputStyle}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={(e) => e.target.style.borderColor = '#2c5f2d'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />

                <input
                    type="password"
                    placeholder="Confirm password"
                    style={inputStyle}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    onFocus={(e) => e.target.style.borderColor = '#2c5f2d'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />

                {error && 
                    <div style={{ 
                        fontSize: '14px', 
                        color: '#dc3545',
                        marginBottom: '12px',
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
                        marginBottom: '12px',
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
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        marginBottom: '12px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#234d23'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2c5f2d'}
                >
                    Register
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
                    Return to Login
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

export default Register;