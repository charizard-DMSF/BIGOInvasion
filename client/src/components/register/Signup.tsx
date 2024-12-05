import React from 'react';
import { useNavigate } from 'react-router-dom';
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
      const response = await fetch('/createUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      message.success('Account created successfully!');
      navigate('/game');
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Become a member now!</h1>
          <p className="mt-2 text-gray-600">Please enter your details</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="signup-username" className="block text-sm font-medium text-gray-700">
              Username:
            </label>
            <Input
              type="text"
              id="signup-username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700">
              Password:
            </label>
            <Input
              type="password"
              id="signup-password"
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
              SIGN UP
            </Button>

            <Button className="w-full">
              Sign up with GitHub
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;