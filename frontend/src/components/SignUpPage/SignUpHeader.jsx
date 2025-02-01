import React from "react";
import { Link } from "react-router-dom";
import "./SignUpHeader.css";

const SignUpHeader = () => {
  return (
    <header className="signup-header">
      <div className="signup-logo">
        <img src="/Logo.png" alt="Logo" className="logo-image" />
      </div>
      <nav className="header-nav">
        <a href="/" className="nav-link">Home</a>
        <a href="#contact" className="nav-link">Contact Us</a>
        <a href="#vision" className="nav-link">Our Vision</a>
      </nav>
      <div className="header-buttons">
        <Link to = "/Auth" className="button-81">Login</Link>
      </div>
    </header>
  );
};

export default SignUpHeader;
