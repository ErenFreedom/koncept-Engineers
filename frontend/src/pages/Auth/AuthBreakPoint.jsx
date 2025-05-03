import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import AuthHeader from "../../components/AuthPage/AuthHeader"; 
import HomeFooter from "../../components/HomePage/HomeFooter"; 
import "./Auth.css"; 

const AuthBreakPoint = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const navigate = useNavigate(); 

  const handleCheckboxChange = (option) => {
    setSelectedOption(option);
  };

  const handleNextClick = () => {
    if (selectedOption === "admin") {
      navigate("/AuthAdmin"); 
    } else if (selectedOption === "staff") {
      navigate("/AuthStaff"); 
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
          disabled={!selectedOption} 
          onClick={handleNextClick} 
        >
          Next
        </button>
      </div>
      <HomeFooter /> {/* Footer */}
    </div>
  );
};

export default AuthBreakPoint;
