import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/background.jpeg';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.css';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    function buildPath(route: string) {
        return `http://localhost:5000/${route}`;
    }
    /*async function changePass(event: React.FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        
        if (!login || !password) {
            setError("Please fill out all forms");
            return;
        }

        setIsLoading(true);
        setError('');

        try { 
            const response = await fetch(buildPath('api/login'), {
                method: 'POST',
                body: JSON.stringify({ login, password }),
                headers: { 'Content-Type': 'application/json' },
            });

            const res = await response.json();

            if (!response.ok) {
                // Handle error responses
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
            
            // Navigate to the card page
            navigate('/CardPage');
            
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Error connecting to the Server');
        } finally {
            setIsLoading(false);
        }
    }*/

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
            <form id="loginDiv" onSubmit={changePass} className="text-center">
                <span id="inner-title">Login</span>
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
                    value={isLoading ? "Logging in..." : "Login"}
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

export default Login;