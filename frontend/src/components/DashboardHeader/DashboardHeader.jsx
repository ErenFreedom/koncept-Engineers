import React, { useState, useRef, useEffect } from "react";
import { Bell, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import "./DashboardHeader.css";

const DashboardHeader = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("identifier");
    navigate("/Auth");
  };

  const handleEditProfile = () => {
    setShowModal(true);
  };

  const verifyPasswordAndNavigate = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      toast.error("Missing token. Please log in again.");
      navigate("/Auth");
      return;
    }

    const decoded = jwtDecode(token);
    const adminId = decoded.adminId;

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/admin/profile/verify-password`, {
        adminId,
        password,
      });

      if (response.data.success) {
        toast.success("✅ Verified successfully!");
        setShowModal(false);
        setPassword("");
        navigate(`/admin/edit-profile/${adminId}`);
      } else {
        toast.error("❌ Incorrect password.");
      }
    } catch (err) {
      console.error("❌ Password verification failed:", err);
      toast.error("Something went wrong while verifying.");
    }
  };

  return (
    <>
      <header className="dashboard-header">
        <div className="dashboard-logo">
          <img src="/Logo.png" alt="Koncept Engineers Logo" className="logo-image" />
        </div>

        <div className="dashboard-title">Koncept Manager - Overview</div>

        <div className="dashboard-icons">
          <Bell className="notification-icon" />
          <div className="profile-dropdown" ref={dropdownRef}>
            <User
              className="profile-icon"
              onClick={() => setDropdownVisible((prev) => !prev)}
            />
            {dropdownVisible && (
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={() => navigate("/admin/view-profile")}>
                  👤 View Profile
                </div>
                <div className="dropdown-item" onClick={handleEditProfile}>
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

      {/* ✅ Password Prompt Modal */}
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
