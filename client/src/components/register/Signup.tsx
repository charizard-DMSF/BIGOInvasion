import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input, Button, message } from 'antd';

interface SignupFormData {
  username: string;
  password: string;
}

const Signup = () => {
  const [formData, setFormData] = React.useState<SignupFormData>({
    username: '',
    password: ''
  });
  const [loading, setLoading] = React.useState<boolean>(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id.replace('signup-', '')]: value
    }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/createUser', {
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
        throw new Error(data.error || 'Signup failed');
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

      message.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      console.error('Signup error:', error);
      message.error(error instanceof Error ? error.message : 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="menu-container">
      <div className="menu-title">Create Account</div>
      <div className="menu-options">
        <form onSubmit={handleSignup} style={{ width: '300px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="signup-username" style={{ display: 'block', marginBottom: '8px' }}>
              Username:
            </label>
            <Input
              type="text"
              id="signup-username"
              value={formData.username}
              onChange={handleChange}
              required
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="signup-password" style={{ display: 'block', marginBottom: '8px' }}>
              Password:
            </label>
            <Input.Password
              id="signup-password"
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
            Create Account
          </Button>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#4caf50' }}>
              Log In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;