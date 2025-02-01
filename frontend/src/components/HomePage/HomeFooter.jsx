import React from "react";
import "./Home.css";
import { FaTwitter, FaLinkedin, FaEnvelope } from "react-icons/fa";

const HomeFooter = () => {
  return (
    <footer className="home-footer">
      <div className="social-icons">
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="icon-link">
          <FaTwitter />
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="icon-link">
          <FaLinkedin />
        </a>
        <a href="mailto:your_email@gmail.com" className="icon-link">
          <FaEnvelope />
        </a>
      </div>
      <div className="copyright">
        &copy; 2025 Koncept Engineers. All Rights Reserved.
      </div>
    </footer>
  );
};

export default HomeFooter;
