import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/background.jpeg';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.css';

const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://134.199.193.253:5000'

    const email = searchParams.get('email');
    const token = searchParams.get('token');

    useEffect(() => {
        if (!email || !token) {
            setError('Invalid or missing reset link.');
        }
    }, [email, token]);

    function buildPath(route: string) {
        return `${backendURL}/${route}`;
    }
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

        try { 
            const response = await fetch(buildPath('api/resetpass'), {
                method: 'POST',
                body: JSON.stringify({ email, token, newPassword: password }),
                headers: { 'Content-Type': 'application/json' },
            });

            const res = await response.json();

            if (!response.ok) {
                // Handle error responses
                setError(res.error);
                setIsLoading(false);
                return;
            }

            setSuccess('Password has been reset successfully!');
            console.log('Reset Password Success:', res);
            
            setTimeout(() => navigate('/login'), 2000);
            
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
        position: 'relative',
    };

    return (
        <div style={backgroundStyle}>
            <form id="loginDiv" onSubmit={passReset} className="text-center">
                <span id="inner-title">Reset Password</span>
                <br />
                <input
                    type="password"
                    id="newPassword"
                    placeholder="New Password"
                    className="form-control mx-auto my-3"
                    style={{   
                        fontSize: '25px', 
                        width: '80%', 
                        borderRadius: '25px', 
                        backgroundColor: 'rgba(255,255,255,0.6)', 
                        textAlign: 'center' 
                    }}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={isLoading}
                />
                <input
                    type="password"
                    id="confirmPass"
                    placeholder="Confirm Password"
                    className="form-control mx-auto my-3"
                    style={{ 
                        fontSize: '25px', 
                        width: '80%', 
                        borderRadius: '25px', 
                        backgroundColor: 'rgba(255,255,255,0.6)', 
                        textAlign: 'center' 
                    }}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                />
                {error && 
                    <div style={{ 
                        fontSize: '15px', 
                        color: 'red', 
                        marginBottom: '10px' 
                    }}>
                        {error}
                    </div>
                }
                <input
                    type="submit"
                    id="loginButton"
                    className="btn btn-primary buttons"
                    value={isLoading ? "Updating..." : "Reset Password"}
                    style={{ 
                        fontSize: '28px', 
                        borderRadius: '25px', 
                        width: '55%',
                        margin: '0 auto', 
                        display: 'block',
                        backgroundColor: 'darkgreen',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        opacity: isLoading ? 0.7 : 1
                    }}
                    disabled={isLoading}
                />
                <span id="loginResult"></span>
            </form>
            
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