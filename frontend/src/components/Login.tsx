import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/background.jpeg';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.css';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    function buildPath(route: string) {
        return `API_URL + '/api/${route}`;
    }
    async function doLogin(event: React.FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        
        if (!email || !password) {
            setError("Please fill out all forms");
            return;
        }

        setIsLoading(true);
        setError('');

        try { 
            const response = await fetch(buildPath('api/login'), {
                method: 'POST',
                body: JSON.stringify({ email, password }),
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
            <form id="loginDiv" onSubmit={doLogin} className="text-center">
                <span id="inner-title">Login</span>
                <br />
                <input
                    type="text"
                    id="loginName"
                    placeholder="Enter your email"
                    className="form-control mx-auto my-3"
                    style={{   
                        fontSize: '25px', 
                        width: '80%', 
                        borderRadius: '25px', 
                        backgroundColor: 'rgba(255,255,255,0.6)', 
                        textAlign: 'center' 
                    }}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={isLoading}
                />
                <input
                    type="password"
                    id="loginPassword"
                    placeholder="Enter your password"
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
                {error && 
                    <div style={{ 
                        fontSize: '15px', 
                        color: 'red', 
                        marginBottom: '10px' 
                    }}>
                        {error}
                    </div>
                }
                <p
                    style={{
                        marginTop: '10px',
                        fontSize: '16px',
                    }}
                >
                    <span
                        onClick={() => !isLoading && navigate('/forgotpass')}
                        style={{
                            color: 'blue',
                            textDecoration: 'underline',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            opacity: isLoading ? 0.5 : 1
                        }}
                    >
                        Forgot Password?
                    </span>
                </p>
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
                <p
                    style={{
                        marginTop: '10px',
                        fontSize: '16px',
                    }}
                >
                    Don't have an account?{' '}
                    <span
                        onClick={() => !isLoading && navigate('/register')}
                        style={{
                            color: 'blue',
                            textDecoration: 'underline',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            opacity: isLoading ? 0.5 : 1
                        }}
                    >
                        Register here
                    </span>
                </p>
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