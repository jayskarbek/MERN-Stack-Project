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
        <span id="loginResult"></span>
      </form>
    </div>
  );
};

export default Login;