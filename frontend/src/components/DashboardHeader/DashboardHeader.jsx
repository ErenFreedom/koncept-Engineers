import React, { useState, useEffect, useRef } from "react";
import { Bell, User, AppWindow } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import Launchpad from "../Launchpad/Launchpad";
import "./DashboardHeader.css";

const DashboardHeader = ({ onSelect }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [showLaunchpad, setShowLaunchpad] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { admin, accessToken, logout } = useAuth();

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setDropdownVisible((v) => !v);
    } else if (e.key === "Escape") {
      setDropdownVisible(false);
    }
  };

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
    } catch (error) {
      console.warn("Logout request failed:", error);
    }
    logout();
    navigate("/Auth");
  };

  const verifyPassword = async () => {
    if (!password.trim()) {
      toast.error("Password cannot be empty");
      return;
    }
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/admin/profile/verify-password`,
        { adminId: admin.id, password },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response.data.success) {
        toast.success("Password verified!");
        setShowModal(false);
        setPassword("");
        navigate(`/admin/edit-profile/${admin.id}`);
      } else {
        toast.error("Incorrect password");
      }
    } catch (err) {
      toast.error("Verification failed");
      console.error(err);
    }
  };

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape" && showModal) {
        setShowModal(false);
        setPassword("");
      }
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [showModal]);

  return (
    <>
      <header className="dashboard-header">
        <div className="dashboard-logo">
          <img src="/Logo.png" alt="Koncept Engineers Logo" className="logo-image" />
        </div>

        <div className="dashboard-title">Koncept Manager - Overview</div>

        <div className="dashboard-icons" ref={dropdownRef}>
          <AppWindow
            className="launchpad-icon"
            title="Open Launchpad"
            onClick={() => setShowLaunchpad(true)}
            role="button"
            tabIndex={0}
          />
          <Bell className="notification-icon" />

          <User
            className="profile-icon"
            role="button"
            tabIndex={0}
            aria-haspopup="true"
            aria-expanded={dropdownVisible}
            onClick={() => setDropdownVisible((v) => !v)}
            onKeyDown={handleProfileKeyDown}
          />

          {dropdownVisible && (
            <div className="dropdown-menu" role="menu" aria-label="Profile options">
              <div
                tabIndex={0}
                role="menuitem"
                className="dropdown-item"
                onClick={() => {
                  navigate("/admin/view-profile");
                  setDropdownVisible(false);
                }}
              >
                👤 View Profile
              </div>
              <div
                tabIndex={0}
                role="menuitem"
                className="dropdown-item"
                onClick={() => {
                  setShowModal(true);
                  setDropdownVisible(false);
                }}
              >
                ✏️ Edit Profile
              </div>
              <div className="dropdown-item" role="menuitem">🔐 Change Password</div>
              <div className="dropdown-item" role="menuitem">❓ Need Help?</div>
              <div
                className="dropdown-item logout"
                role="menuitem"
                onClick={handleLogout}
              >
                🚪 Logout
              </div>
            </div>
          )}
        </div>
      </header>

      {showLaunchpad && (
        <Launchpad
          onClose={() => setShowLaunchpad(false)}
          onSelect={onSelect} // ✅ Pass handler for module selection
        />
      )}

      {showModal && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => {
            if (e.target.className === "modal-overlay") {
              setShowModal(false);
              setPassword("");
            }
          }}
        >
          <div className="modal-content">
            <h2 id="modal-title">🔒 Confirm Password</h2>
            <p>Enter your password to proceed to Edit Profile:</p>
            <input
              type="password"
              className="modal-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              aria-label="Password"
            />
            <div className="modal-buttons">
              <button
                className="modal-cancel"
                onClick={() => {
                  setShowModal(false);
                  setPassword("");
                }}
              >
                Cancel
              </button>
              <button
                className="modal-submit"
                onClick={verifyPassword}
                disabled={!password.trim()}
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardHeader;



