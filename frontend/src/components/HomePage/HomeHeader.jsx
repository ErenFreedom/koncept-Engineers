import React from "react";
import { Link } from "react-router-dom"; 
import "./Home.css";

const HomeHeader = () => {
  return (
    <header className="home-header">
      <div className="home-logo">
        <img src="/Logo.png" alt="Logo" className="logo-image" />
      </div>
      <nav className="header-nav">
        <a href="#home" className="nav-link">Home</a>
        <a href="#contact" className="nav-link">Contact Us</a>
        <a href="#vision" className="nav-link">Our Vision</a>
      </nav>
      <div className="header-buttons">
        
        <Link to="/SignUp" className="button-81">Signup</Link>
        <Link to="/Auth" className="button-81">Login</Link>
      </div>
    </header>
  );
};

export default HomeHeader;
