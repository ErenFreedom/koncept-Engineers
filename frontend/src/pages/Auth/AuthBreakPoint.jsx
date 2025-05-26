import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const PuzzleShieldAdmin = ({ isSelected }) => (
  <svg
    width="120"
    height="140"
    viewBox="0 0 120 140"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ filter: isSelected ? "drop-shadow(0 0 8px #23aaff)" : "none", transition: "all 0.3s ease" }}
  >
    {/* Shield outline */}
    <path
      d="M60 5 L110 30 V90 L60 135 L10 90 V30 Z"
      fill={isSelected ? "#1c62af" : "#0d1c3e"}
      stroke={isSelected ? "#23aaff" : "#142b60"}
      strokeWidth="4"
    />
    {/* Puzzle pieces */}
    <polygon
      points="60,5 85,18 85,45 60,60 35,45 35,18"
      fill={isSelected ? "#1764a1" : "#0a1630"}
      stroke="#0a1630"
      strokeWidth="1"
    />
    <polygon
      points="85,18 110,30 110,60 85,45"
      fill={isSelected ? "#1a7ec0" : "#142b60"}
      stroke="#0a1630"
      strokeWidth="1"
    />
    <polygon
      points="35,45 60,60 60,90 35,90"
      fill={isSelected ? "#1a7ec0" : "#142b60"}
      stroke="#0a1630"
      strokeWidth="1"
    />
    <polygon
      points="85,45 110,60 110,90 85,90"
      fill={isSelected ? "#1764a1" : "#0a1630"}
      stroke="#0a1630"
      strokeWidth="1"
    />
    <polygon
      points="35,90 60,90 60,135 35,110"
      fill={isSelected ? "#174a85" : "#0a1630"}
      stroke="#0a1630"
      strokeWidth="1"
    />
    <polygon
      points="85,90 110,90 85,110 60,135"
      fill={isSelected ? "#1c62af" : "#0a1630"}
      stroke="#0a1630"
      strokeWidth="1"
    />
    {/* Lock icon */}
    <rect x="50" y="70" width="20" height="25" rx="3" ry="3" fill="#23aaff" />
    <circle cx="60" cy="90" r="5" fill="#0d1c3e" />
    <rect x="58" y="60" width="4" height="10" fill="#23aaff" />
  </svg>
);

const PuzzleShieldStaff = ({ isSelected }) => (
  <svg
    width="120"
    height="140"
    viewBox="0 0 120 140"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ filter: isSelected ? "drop-shadow(0 0 8px #23aaff)" : "none", transition: "all 0.3s ease" }}
  >
    {/* Shield base */}
    <path
      d="M60 5 L110 30 V90 L60 135 L10 90 V30 Z"
      fill={isSelected ? "#1c62af" : "#0d1c3e"}
      stroke={isSelected ? "#23aaff" : "#142b60"}
      strokeWidth="4"
    />
    {/* Puzzle pieces (same as Admin for simplicity) */}
    <polygon
      points="60,5 85,18 85,45 60,60 35,45 35,18"
      fill={isSelected ? "#1764a1" : "#0a1630"}
      stroke="#0a1630"
      strokeWidth="1"
    />
    <polygon
      points="85,18 110,30 110,60 85,45"
      fill={isSelected ? "#1a7ec0" : "#142b60"}
      stroke="#0a1630"
      strokeWidth="1"
    />
    <polygon
      points="35,45 60,60 60,90 35,90"
      fill={isSelected ? "#1a7ec0" : "#142b60"}
      stroke="#0a1630"
      strokeWidth="1"
    />
    <polygon
      points="85,45 110,60 110,90 85,90"
      fill={isSelected ? "#1764a1" : "#0a1630"}
      stroke="#0a1630"
      strokeWidth="1"
    />
    <polygon
      points="35,90 60,90 60,135 35,110"
      fill={isSelected ? "#174a85" : "#0a1630"}
      stroke="#0a1630"
      strokeWidth="1"
    />
    <polygon
      points="85,90 110,90 85,110 60,135"
      fill={isSelected ? "#1c62af" : "#0a1630"}
      stroke="#0a1630"
      strokeWidth="1"
    />
    {/* Helmet icon */}
    <ellipse cx="60" cy="90" rx="18" ry="10" fill="#23aaff" />
    <rect x="50" y="80" width="20" height="12" fill="#0d1c3e" />
    <path d="M50 80 Q60 65 70 80" stroke="#23aaff" strokeWidth="3" fill="none" />
  </svg>
);

const AuthBreakPoint = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const navigate = useNavigate();

  const handleSelect = (option) => setSelectedOption(option);

  const handleNextClick = () => {
    if (selectedOption === "admin") {
      navigate("/AuthAdmin");
    } else if (selectedOption === "staff") {
      navigate("/AuthStaff");
    }
  };

  return (
    <div className="auth-container">
      <h1 className="auth-question">
        Access Control 
      </h1>
       <p className="auth-subtitle">Select your role to enter the system</p>


      <div className="access-cards-container">
        <div
          className={`access-card ${selectedOption === "admin" ? "selected" : ""}`}
          onClick={() => handleSelect("admin")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleSelect("admin")}
        >
          <PuzzleShieldAdmin isSelected={selectedOption === "admin"} />
          <h2>Admin Access</h2>
          <p>🔒 Secure Entry</p>
          <button className="enter-button">ENTER AS ADMIN</button>
        </div>

        <div
          className={`access-card ${selectedOption === "staff" ? "selected" : ""}`}
          onClick={() => handleSelect("staff")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleSelect("staff")}
        >
          <PuzzleShieldStaff isSelected={selectedOption === "staff"} />
          <h2>Staff Access</h2>
          <p>👷 Assigned Access</p>
          <button className="enter-button">ENTER AS STAFF</button>
        </div>
      </div>

      <button
        className="auth-button"
        disabled={!selectedOption}
        onClick={handleNextClick}
      >
        Next
      </button>
    </div>
  );
};

export default AuthBreakPoint;



