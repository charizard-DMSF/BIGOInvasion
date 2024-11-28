const Login = () => {
  return (
    <div className="login">
      <label htmlFor="login-username">
        Username:
        <input type="text" id="login-username" />
      </label>
      <label htmlFor="login-password">
        Password:
        <input type="password" id="login-password" />
      </label>
    </div>
  );
};

export default Login;
