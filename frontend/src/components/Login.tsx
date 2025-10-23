import './Login.css';

function Login() {
    function doLogin(event: any): void {
        event.preventDefault();
        alert('doIt()');
    }
    return (
        <div id="loginDiv">
            <span id="inner-title">PLEASE LOG IN</span><br />
            <input type="text" id="loginName" placeholder="Username" /><br />
            <input type="password" id="loginPassword" placeholder="Password" /><br />
            <input type="submit" id="loginButton" className="buttons" value="Login"
                onClick={doLogin} />
            <input type="submit" id="registerButton" className="buttons" value="Register New Account"
                /*onClick={doRegister}*/ />    
            <span id="loginResult"></span>
        </div>
    );
};
export default Login;