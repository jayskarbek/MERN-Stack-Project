import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/background.jpeg';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Register.css';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    function buildPath(route: string) {
        return `http://localhost:5000/${route}`;
    }

    async function doRegister(event: React.FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        
        if (!login || !password || !firstName || !lastName) {
            setError("Please fill out all forms");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const response = await fetch(buildPath('api/register'), {
                method: 'POST',
                body: JSON.stringify({ login, password, firstName, lastName }),
                headers: { 'Content-Type': 'application/json' },
            });

            const res = await response.json();

            if (!response.ok) {
                setError(res.error);
                setSuccess('');
                return;
            }

            setError('');
            setSuccess('Registration Successful! ');
            console.log('Registered user:', res.user);

            setTimeout(() => navigate('/login'), 2000);

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
        <form id="loginDiv" onSubmit={doRegister} className="text-center">
            <span id="inner-title">Register</span>
            <br />
            <input
                type="text"
                id="registerFirstName"
                placeholder="Enter your first name"
                className="form-control mx-auto my-3"
                style={{   
                    fontSize: '25px', 
                    width: '80%', 
                    borderRadius: '25px', 
                    backgroundColor: 'rgba(255,255,255,0.6)', 
                    textAlign: 'center' }}
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
            />
            <input
                type="text"
                id="registerLastName"
                placeholder="Enter your last name"
                className="form-control mx-auto my-3"
                style={{   
                    fontSize: '25px', 
                    width: '80%', 
                    borderRadius: '25px', 
                    backgroundColor: 'rgba(255,255,255,0.6)', 
                    textAlign: 'center' }}
                value={lastName}
                onChange={e => setLastName(e.target.value)}
            />
            <input
                type="email"
                id="registerEmail"
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
                id="registerPassword"
                placeholder="Create a password"
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
            <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm your password"
                className="form-control mx-auto my-3"
                style={{ 
                    fontSize: '25px', 
                    width: '80%', 
                    borderRadius: '25px', 
                    backgroundColor: 'rgba(255,255,255,0.6)', 
                    textAlign: 'center' }}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
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