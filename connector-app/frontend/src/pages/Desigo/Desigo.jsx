import React, { useState } from "react";
import "./Desigo.css";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa"; // Import Success Icon
import Footer from "../../components/Footer/Footer";

const Desigo = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [authenticated, setAuthenticated] = useState(false);

    const handleAuthenticate = () => {
        setLoading(true); // Show loading animation
        setTimeout(() => {
            setLoading(false);
            setAuthenticated(true); // Authentication success
        }, 5000); // Simulating API request time (5 seconds)
    };

    return (
        <div className="desigo-page">
            {/* Header Section */}
            <header className="desigo-header">
                <div className="desigo-logo-container">
                    <img src={logo} alt="Logo" className="desigo-logo" />
                </div>

                <div className="desigo-button-container">
                    <button className="desigo-button" onClick={() => navigate("/")}>Home</button>
                </div>
            </header>

            {/* Main Content */}
            <div className="desigo-content">
                <h2 className="desigo-title">Authenticate Desigo CC</h2>
                <p className="desigo-subtext">Please enter your credentials to connect to Desigo CC.</p>

                {/* Authentication Form */}
                <div className="desigo-auth-form">
                    <input type="text" placeholder="Desigo CC Username" className="desigo-input" />
                    <input type="password" placeholder="Desigo CC Password" className="desigo-input" />

                    {/* Button Changes on Success */}
                    {authenticated ? (
                        <button className="desigo-auth-button" onClick={() => navigate("/dashboard")}>Proceed to Dashboard</button>
                    ) : (
                        <button className="desigo-auth-button" onClick={handleAuthenticate} disabled={loading}>
                            {loading ? "Authenticating..." : "Authenticate"}
                        </button>
                    )}

                    {/* Loading Animation -> Green Check on Success */}
                    {loading && <div className="loading-spinner"></div>}
                    {authenticated && (
                        <div className="success-container">
                            <FaCheckCircle className="success-icon" />
                            <p className="success-text">Authentication Successful</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Section */}
            <Footer />
        </div>
    );
};

export default Desigo;
