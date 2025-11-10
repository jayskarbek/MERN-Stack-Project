import React, { useState } from 'react';
//import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/background.jpeg';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ForgotPassword.css';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://134.199.193.253:5000'

    function buildPath(route: string) {
        return `${backendURL}/${route}`;
    }

    async function doForgotPass(event: React.FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        
        if (!email) {
            setError("Please enter your email");
            return;
        }

        try {
            const response = await fetch(buildPath('api/forgotpass'), {
                method: 'POST',
                body: JSON.stringify({ email }),
                headers: { 'Content-Type': 'application/json' },
            });

            const res = await response.json();

            if (!response.ok) {
                setError(res.error);
                setSuccess('');
                return;
            }

            setError('');
            setSuccess('Password reset link sent to your email!');

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
    };

  return (
    <div style={backgroundStyle}>
        <form id="passDiv" onSubmit={doForgotPass} className="text-center">
            <span id="inner-title">Forgot Password</span>
            <br />
            <input
                type="email"
                id="emailAddress"
                placeholder="Enter your email"
                className="form-control mx-auto my-3"
                style={{ 
                    fontSize: '25px', 
                    width: '80%', 
                    borderRadius: '25px', 
                    backgroundColor: 'rgba(255,255,255,0.6)', 
                    textAlign: 'center' }}
                value={email}
                onChange={e => setEmail(e.target.value)}
            />
            {error && 
                <div style={{ 
                    fontSize: '15px', 
                    color: 'red', 
                    marginBottom: '10px' }}
                >{error}
            </div>}
            {success && 
                <div style={{
                    fontSize: '15px',  
                    color: 'green', 
                    marginBottom: '10px' }}
                >{success}
            </div>}
            <input
                type="submit"
                id="registerButton"
                className="btn btn-primary buttons"
                value="Reset Password"
                style={{ 
                    fontSize: '25px', 
                    borderRadius: '25px', 
                    width: '55%',
                    margin: '0 auto', 
                    display: 'block',
                    backgroundColor: 'darkgreen' }}
            />
            <span id="forgotPassResult"></span>
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

export default ForgotPassword;