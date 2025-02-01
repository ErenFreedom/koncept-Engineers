import React from "react";
import AuthHeader from "../../components/AuthPage/AuthHeader"; // Importing the Auth Header
import HomeFooter from "../../components/HomePage/HomeFooter"; // Importing the footer
import "./Auth.css"; // Importing Auth-specific CSS

const StaffAuth = () => {
  return (
    <div>
      <AuthHeader /> {/* Header */}
      <div className="auth-body">
        <h1 className="auth-heading">Staff Login</h1>
        <div className="form-container">
          <label className="form-label">
            Organisation Name
            <input
              type="text"
              className="form-input"
              placeholder="Enter Organisation Name"
            />
          </label>
          <label className="form-label">
            Email
            <input
              type="email"
              className="form-input"
              placeholder="Enter your Email"
            />
          </label>
          <label className="form-label">
            Position at your Organisation
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Software Engineer, Site Engineer"
            />
          </label>
          <label className="form-label">
            Password
            <input
              type="password"
              className="form-input"
              placeholder="Enter your Password"
            />
          </label>
          
        </div>
        <button className="auth-button">Login</button>
        <div className="forgot-password-container">
          {/* Button styled as a link */}
          <button
            className="forgot-password-link"
            onClick={() =>
              alert("Forgot Password functionality coming soon!")
            }
          >
            Forgot Password?
          </button>
        </div>
      </div>
      <HomeFooter /> {/* Footer */}
    </div>
  );
};

export default StaffAuth;
