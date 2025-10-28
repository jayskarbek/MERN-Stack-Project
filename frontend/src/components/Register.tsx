import React from 'react';
import backgroundImage from '../assets/background.jpeg';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Register.css';

const Register: React.FC = () => {
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
    };

  function doRegister(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    alert('doIt()');
  }

  return (
    <div style={backgroundStyle}>
        <form id="loginDiv" onSubmit={doRegister} className="text-center">
            <span id="inner-title">Register</span>
            <br />
            <input
                type="text"
                id="registerName"
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
                type="email"
                id="registerEmail"
                placeholder="Email"
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
                id="registerPassword"
                placeholder="Password"
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
                id="confirmPassword"
                placeholder="Confirm Password"
                className="form-control mx-auto my-3"
                style={{ 
                    fontSize: '25px', 
                    width: '80%', 
                    borderRadius: '25px', 
                    backgroundColor: 'rgba(255,255,255,0.6)', 
                    textAlign: 'center' }}
            />
            <input
                type="submit"
                id="registerButton"
                className="btn btn-primary buttons"
                value="Register"
                style={{ 
                    fontSize: '28px', 
                    borderRadius: '25px', 
                    width: '55%',
                    margin: '0 auto', 
                    display: 'block',
                    backgroundColor: 'darkgreen' }}
            />
            <span id="registerResult"></span>
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

export default Register;