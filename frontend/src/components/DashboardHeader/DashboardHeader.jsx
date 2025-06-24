// src/components/DashboardHeader/DashboardHeader.jsx
import React, { useState, useRef, useEffect } from "react";
import { FiGrid, FiPhone, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./DashboardHeader.css";
import { useAuth } from "../../context/AuthContext";

const DashboardHeader = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [showLaunchpad, setShowLaunchpad] = useState(false);


  const { admin, accessToken, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const sessionId = localStorage.getItem("sessionId");
      if (sessionId && admin?.id) {
        await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/admin/auth/logout`,
          { adminId: admin.id, sessionId },
          { withCredentials: true }
        );
      }
    } catch (err) {
      console.warn("Logout failed silently:", err);
    }
    logout();
    navigate("/Auth");
  };

  const verifyPasswordAndNavigate = async () => {
    if (!accessToken || !admin?.id) {
      toast.error("Missing credentials. Please login again.");
      navigate("/Auth");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/admin/profile/verify-password`,
        {
          adminId: admin.id,
          password,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("✅ Verified successfully!");
        setShowModal(false);
        setPassword("");
        navigate(`/admin/edit-profile/${admin.id}`);
      } else {
        toast.error("❌ Incorrect password.");
      }
    } catch (err) {
      console.error("Password verification failed:", err);
      toast.error("Something went wrong while verifying.");
    }
  };

  return (
    <>
      <header className="dashboard-header">
        <div className="header-left">
          <img src="/Logo.png" alt="Koncept Logo" className="header-logo" />
          <h2 className="header-title">Home</h2>
        </div>

        <div className="header-right">
          <FiGrid className="header-icon" title="Apps" onClick={() => setShowLaunchpad(!showLaunchpad)} />

          <FiPhone className="header-icon" title="Contact Us" />
          <div className="profile-dropdown" ref={dropdownRef}>
            <FiUser className="header-icon" title="Profile" onClick={() => setDropdownVisible((prev) => !prev)} />
            {dropdownVisible && (
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={() => navigate("/admin/view-profile")}>
                  👤 View Profile
                </div>
                <div className="dropdown-item" onClick={() => setShowModal(true)}>
                  ✏️ Edit Profile
                </div>
                <div className="dropdown-item">🔐 Change Password</div>
                <div className="dropdown-item">❓ Need Help?</div>
                <div className="dropdown-item logout" onClick={handleLogout}>
                  🚪 Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {showLaunchpad && (
        <>
          <div className="launchpad-overlay" onClick={() => setShowLaunchpad(false)} />
          <div className="launchpad-panel">
            <h3 className="launchpad-title">Launchpad</h3>
            <p className="launchpad-subtitle">Access all your apps</p>

            <div className="launchpad-grid">
              {[
                { label: "Home", icon: "/Home.png" },
                { label: "Operations Manager", icon: "/Operational.png" },
                { label: "Accounts", icon: "/Accounts.png" },
                { label: "Devices", icon: "/Devices.png" },
                { label: "Data Setup", icon: "/DataSetup.png" }
              ].map((item, idx) => (
                <div key={idx} className="launchpad-item">
                  <img src={item.icon} alt={item.label} className="launchpad-icon" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}


      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>🔒 Confirm Password</h2>
            <p>Enter your password to proceed to Edit Profile:</p>
            <input
              type="password"
              className="modal-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="modal-buttons">
              <button className="modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="modal-submit" onClick={verifyPasswordAndNavigate}>Verify</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardHeader;
