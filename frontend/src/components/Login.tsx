import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/background.jpeg';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.css';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    function buildPath(route: string) {
        return `http://localhost:5000/${route}`;
    }
    async function doLogin(event: React.FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        
        if (!login || !password) {
            setError("Please fill out all forms");
            return;
        }

        try {
            const response = await fetch(buildPath('api/login'), {
                method: 'POST',
                body: JSON.stringify({ login, password }),
                headers: { 'Content-Type': 'application/json' },
            });

            const res = await response.json();

            if (res.id === -1) {
                setError('Invalid username or password');
            } else {
                setError(''); 
                console.log('Login successful:', res);
                navigate('/Home');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Error connecting to the Server');
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
                    textAlign: 'center' }}
                value={login}
                onChange={e => setLogin(e.target.value)}
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
                    textAlign: 'center' }}
                value={password}
                onChange={e => setPassword(e.target.value)}
            />
            {error && 
            <div style={{ 
                        fontSize: '15px', 
                        color: 'red', 
                        marginBottom: '10px' }}
            >{error}
            </div>}
            <a 
                href="?"
                style={{
                    marginTop: '5px',
                    fontSize: '15px',
                }}
            >
                Forgot Password?
            </a>
            <input
                type="submit"
                id="loginButton"
                className="btn btn-primary buttons"
                value="Login"
                style={{ 
                    fontSize: '28px', 
                    borderRadius: '25px', 
                    width: '55%',
                    margin: '0 auto', 
                    display: 'block',
                    backgroundColor: 'darkgreen' }}
            />
            <p
                style={{
                    marginTop: '10px',
                    fontSize: '16px',
                }}
            >
                Don’t have an account?{' '}
            <span
                onClick={() => navigate('/register')}
                style={{
                    color: 'blue',
                    textDecoration: 'underline',
                    cursor: 'pointer',
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