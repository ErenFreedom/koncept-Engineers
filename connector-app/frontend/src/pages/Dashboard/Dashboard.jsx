import React, { useState } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa"; // Profile Icon
import logo from "../../assets/logo.png";
import Footer from "../../components/Footer/Footer";

const Dashboard = () => {
    const navigate = useNavigate();
    const [activePage, setActivePage] = useState("sensor-bank"); // Default page state

    return (
        <div className="dashboard-page">
            {/* Header Section */}
            <header className="dashboard-header">
                <div className="dashboard-logo-container">
                    <img src={logo} alt="Logo" className="dashboard-logo" />
                </div>

                {/* Center Header - Page Switching */}
                <div className="dashboard-center-menu">
                    <button
                        className={`dashboard-nav-button ${activePage === "sensor-bank" ? "active" : ""}`}
                        onClick={() => setActivePage("sensor-bank")}
                    >
                        Sensor Bank
                    </button>
                    <button
                        className={`dashboard-nav-button ${activePage === "active-sensors" ? "active" : ""}`}
                        onClick={() => setActivePage("active-sensors")}
                    >
                        Active Sensors
                    </button>
                </div>

                {/* Right Side - Profile Icon & Home */}
                <div className="dashboard-button-container">
                    <FaUserCircle className="dashboard-profile-icon" />
                    <button className="dashboard-button" onClick={() => navigate("/")}>Home</button>
                </div>
            </header>

            {/* Main Content */}
            <div className="dashboard-content">
                {activePage === "sensor-bank" ? (
                    <>
                        <h2 className="dashboard-title">Sensor Bank</h2>
                        <p className="dashboard-subtext">Manage and store your sensors efficiently.</p>
                    </>
                ) : (
                    <>
                        <h2 className="dashboard-title">Active Sensors</h2>
                        <p className="dashboard-subtext">Monitor active sensors in real time.</p>
                    </>
                )}
            </div>

            {/* Footer Section */}
            <Footer />
        </div>
    );
};

export default Dashboard;
