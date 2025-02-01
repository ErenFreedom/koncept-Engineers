import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import AuthHeader from "../../components/AuthPage/AuthHeader"; // Importing the AuthHeader
import HomeFooter from "../../components/HomePage/HomeFooter"; // Importing the footer
import "./Auth.css"; // Importing Auth-specific CSS

const AuthBreakPoint = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const navigate = useNavigate(); // Hook for navigation

  const handleCheckboxChange = (option) => {
    setSelectedOption(option);
  };

  const handleNextClick = () => {
    if (selectedOption === "admin") {
      navigate("/AuthAdmin"); // Navigate to Admin login page
    } else if (selectedOption === "staff") {
      navigate("/AuthStaff"); // Navigate to Staff login page
    }
  };

  return (
    <div>
      <AuthHeader /> {/* Header */}
      <div className="auth-body">
        <h1 className="auth-question">
          Are you logging in as an Admin or Staff for the organisation?
        </h1>
        <div className="auth-checkbox-container">
          <label className="auth-checkbox-label">
            <input
              type="checkbox"
              className="auth-checkbox-input"
              checked={selectedOption === "admin"}
              onChange={() => handleCheckboxChange("admin")}
            />
            Admin
          </label>
          <label className="auth-checkbox-label">
            <input
              type="checkbox"
              className="auth-checkbox-input"
              checked={selectedOption === "staff"}
              onChange={() => handleCheckboxChange("staff")}
            />
            Staff
          </label>
        </div>
        <button
          className="auth-button"
          disabled={!selectedOption} // Disable button if no checkbox is selected
          onClick={handleNextClick} // Handle navigation on click
        >
          Next
        </button>
      </div>
      <HomeFooter /> {/* Footer */}
    </div>
  );
};

export default AuthBreakPoint;
