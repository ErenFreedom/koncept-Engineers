import React from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import "./AuthHeader.css"; // Import AuthHeader-specific CSS

const AuthHeader = () => {
  return (
    <header className="auth-header">
      <div className="auth-logo">
        <img src="/Logo.png" alt="Logo" className="logo-image" />
      </div>
      <nav className="header-nav">
        <a href="/" className="nav-link">Home</a>
        <a href="#contact" className="nav-link">Contact Us</a>
        <a href="#vision" className="nav-link">Our Vision</a>
      </nav>
      <div className="header-buttons">
        {/* Only Signup button */}
        <Link to="/SignUp" className="button-81">Signup</Link>
      </div>
    </header>
  );
};

export default AuthHeader;
