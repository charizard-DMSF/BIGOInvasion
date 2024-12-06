import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button, message } from 'antd';

interface FormData {
  username: string;
  password: string;
}

const Login = () => {
  const [formData, setFormData] = React.useState<FormData>({
    username: '',
    password: ''
  });
  const [loading, setLoading] = React.useState<boolean>(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id.replace('login-', '')]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      // Debug log to see what we're getting from the server
      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Make sure we're storing the complete user data
      if (!data.user?.id) {
        console.error('User ID missing from server response:', data);
        throw new Error('Invalid server response');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Debug log to verify what we stored
      console.log('Stored user data:', JSON.parse(localStorage.getItem('user') || '{}'));

      message.success('Login successful!');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      message.error(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="menu-container">
      <div className="menu-title">Welcome Back</div>
      <div className="menu-options">
        <form onSubmit={handleLogin} style={{ width: '300px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="login-username" style={{ display: 'block', marginBottom: '8px' }}>
              Username:
            </label>
            <Input
              type="text"
              id="login-username"
              value={formData.username}
              onChange={handleChange}
              required
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="login-password" style={{ display: 'block', marginBottom: '8px' }}>
              Password:
            </label>
            <Input.Password
              id="login-password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ width: '100%' }}
            />
          </div>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="menu-option"
            style={{ width: '100%', marginBottom: '10px' }}
          >
            Log In
          </Button>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            Need an account?{' '}
            <Link to="/signup" style={{ color: '#4caf50' }}>
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;