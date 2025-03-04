import React, { useState, useEffect } from "react";
import "./Login.css";
import logo from "../../assets/logo.png";
import Login1 from "../../assets/Login1.jpeg";
import Login2 from "../../assets/Login2.jpg";
import Login3 from "../../assets/Login3.png";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import Footer from "../../components/Footer/Footer";

const Login = () => {
    const navigate = useNavigate();

    // Slideshow content
    const images = [Login1, Login2, Login3];
    const texts = [
        "AI-Powered Secure Authentication",
        "Seamless Multi-Factor Login Experience",
        "Fast & Encrypted Data Processing"
    ];
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [buttonText, setButtonText] = useState("Login");

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 3000); // Change every 3 seconds
        return () => clearInterval(interval);
    }, []);

    const handleLogin = () => {
        setLoading(true);
        setButtonText("Processing...");

        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
            setButtonText("Proceed to Verify Server");
        }, 5000);
    };

    return (
        <div className="login-container">
            {/* Header Section */}
            <header className="header">
                <div className="logo-container">
                    <img src={logo} alt="Logo" className="logo" />
                </div>

                <div className="button-container">
                    <button className="button-81" onClick={() => navigate("/")}>Home Page</button>
                    <button className="button-81">Sign Up</button>
                </div>
            </header>

            {/* Main Content - Split into Left (Form) and Right (Slideshow) */}
            <div className="content">
                {/* Left Side - Login Form */}
                <div className="login-form">
                    <h2>Login</h2>
                    <div className="input-group">
                        <input type="email" placeholder="Enter Email" className="input-field" />
                        <input type="password" placeholder="Enter Password" className="input-field" />
                    </div>
                    <button className="button-81" onClick={success ? () => navigate("/desigo-auth") : handleLogin}>
                        {buttonText}
                    </button>

                    {/* Loading & Success Status */}
                    <div className="loading-success-container">
                        {loading && <div className="loading-spinner"></div>}
                        {success && (
                            <div className="success-container">
                                <FaCheckCircle className="success-icon" />
                                <span className="success-text">Login Successful</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side - Image & Text Slideshow */}
                <div className="image-slideshow">
                    <img src={images[currentIndex]} alt="Slideshow" className="slideshow-image" />
                    <p className="slideshow-text">{texts[currentIndex]}</p>
                </div>
            </div>

            {/* Footer Section */}
            <Footer />
        </div>
    );
};

export default Login;
