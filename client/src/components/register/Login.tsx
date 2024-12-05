// Login.tsx
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
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      message.success('Login successful!');
      navigate('/game');
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
          <p className="mt-2 text-gray-600">Please enter your details</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="login-username" className="block text-sm font-medium text-gray-700">
              Username:
            </label>
            <Input
              type="text"
              id="login-username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
              Password:
            </label>
            <Input
              type="password"
              id="login-password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-4">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full"
            >
              LOG IN
            </Button>

            <Button className="w-full">
              Log in with GitHub
            </Button>
          </div>
        </form>

        <div className="text-center text-sm">
          <p className="text-gray-600">
            <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800">
              Forgot password?
            </Link>
          </p>
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:text-blue-800">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;