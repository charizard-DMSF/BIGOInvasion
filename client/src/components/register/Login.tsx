import React from 'react';
import { Link } from 'react-router-dom';  // Correct import for Link
import { Input, Button } from 'antd';

const Login = () => {
  return (
    <div className="content">
      <div className="login">
        <h1>Welcome back!</h1>
        <p>Please enter your details</p>
        <label htmlFor="login-username">
          Username:
          <Input type="text" id="login-username" />
        </label>
        <label htmlFor="login-password">
          Password:
          <Input type="password" id="login-password" />
        </label>
        <Button type="primary" className="button">
          LOG IN
        </Button>
        <Button className="button">Log in with GitHub</Button>
        <p className="small-text">
          <Link to="/signup" className="link">
            Forgot passowrd?
          </Link>
        </p>
        <p className="small-text">
          Don't have an account?{' '}
          <Link to="/signup" className="link">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
