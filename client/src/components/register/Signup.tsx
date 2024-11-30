import { Input, Button } from 'antd';

const Signup = () => {
  return (
    <div className="content">
      <div className="signup">
        <h1>Become a member now!</h1>
        <p>Please enter your details</p>
        <label htmlFor="signup-password">
          Email Address:
          <Input type="password" id="signup-password" />
        </label>
        <label htmlFor="signup-username">
          Username:
          <Input type="text" id="signup-username" />
        </label>
        <label htmlFor="signup-password">
          Password:
          <Input type="password" id="signup-password" />
        </label>
        <Button type="primary" className="button">
          SIGN UP
        </Button>
        <Button className="button">Sign up with GitHub</Button>
      </div>
    </div>
  );
};

export default Signup;
