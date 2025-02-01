import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import SignUpHeader from "../../components/SignUpPage/SignUpHeader"; // Importing the header
import HomeFooter from "../../components/HomePage/HomeFooter"; // Importing the footer
import "./SignUp.css"; // Importing shared CSS

const BreakPoint = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const navigate = useNavigate(); // Hook for navigation

  const handleCheckboxChange = (option) => {
    setSelectedOption(option);
  };

  const handleNextClick = () => {
    if (selectedOption === "admin") {
      navigate("/Admin"); // Navigate to Admin signup page
    } else if (selectedOption === "staff") {
      navigate("/Staff"); // Navigate to Staff signup page
    }
  };

  return (
    <div>
      <SignUpHeader /> {/* Header */}
      <div className="admin-body">
        <h1 className="admin-question">
          Are you registering as an Admin or Staff for the organisation?
        </h1>
        <div className="checkbox-container">
          <label className="checkbox-label">
            <input
              type="checkbox"
              className="checkbox-input"
              checked={selectedOption === "admin"}
              onChange={() => handleCheckboxChange("admin")}
            />
            Admin
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              className="checkbox-input"
              checked={selectedOption === "staff"}
              onChange={() => handleCheckboxChange("staff")}
            />
            Staff
          </label>
        </div>
        <button
          className="button-47"
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

export default BreakPoint;
