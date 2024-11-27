import React from "react"

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
    </div>
  );
};

export default Signup;
