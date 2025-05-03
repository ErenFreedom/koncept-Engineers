import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import SignUpHeader from "../../components/SignUpPage/SignUpHeader"; 
import HomeFooter from "../../components/HomePage/HomeFooter"; 
import "./SignUp.css"; // Importing shared CSS

const BreakPoint = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const navigate = useNavigate(); 

  const handleCheckboxChange = (option) => {
    setSelectedOption(option);
  };

  const handleNextClick = () => {
    if (selectedOption === "admin") {
      navigate("/Admin"); 
    } else if (selectedOption === "staff") {
      navigate("/Staff"); 
    }
  };

  return (
    <div>
      <SignUpHeader /> 
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
          disabled={!selectedOption} 
          onClick={handleNextClick} 
        >
          Next
        </button>
      </div>
      <HomeFooter /> 
    </div>
  );
};

export default BreakPoint;
