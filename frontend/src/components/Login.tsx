import React from 'react';
import backgroundImage from '../assets/background.jpeg';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.css';

const Login: React.FC = () => {
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

    function doLogin(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        alert('doIt()');
    }

  return (
    <div style={backgroundStyle}>
        <form id="loginDiv" onSubmit={doLogin} className="text-center">
            <span id="inner-title">Login</span>
            <br />
            <input
                type="text"
                id="loginName"
                placeholder="Username"
                className="form-control mx-auto my-3"
                style={{   
                    fontSize: '25px', 
                    width: '80%', 
                    borderRadius: '25px', 
                    backgroundColor: 'rgba(255,255,255,0.6)', 
                    textAlign: 'center' }}
            />
            <input
                type="password"
                id="loginPassword"
                placeholder="Password"
                className="form-control mx-auto my-3"
                style={{ 
                    fontSize: '25px', 
                    width: '80%', 
                    borderRadius: '25px', 
                    backgroundColor: 'rgba(255,255,255,0.6)', 
                    textAlign: 'center' }}
            />
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
                //onClick={() => navigate('/register')}
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