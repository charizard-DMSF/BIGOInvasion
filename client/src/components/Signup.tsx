const Signup = () => {
  return (
    <div className="signup">
      <label htmlFor="signup-username">
        Username:
        <input type="text" id="signup-username" />
      </label>
      <label htmlFor="signup-password">
        Password:
        <input type="password" id="signup-password" />
      </label>
      <button className="btn">SIGN-UP</button>
    </div>
  );
};

export default Signup;
