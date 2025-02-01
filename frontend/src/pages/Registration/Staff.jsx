import React, { useState } from "react";
import SignUpHeader from "../../components/SignUpPage/SignUpHeader"; // Importing the header
import HomeFooter from "../../components/HomePage/HomeFooter"; // Importing the footer
import Select from "react-select"; // Import react-select for dropdown
import CountryList from "react-select-country-list"; // Import country list
import PhoneInput from "react-phone-input-2"; // Import react-phone-input-2
import "react-phone-input-2/lib/style.css"; // Styles for phone input
import "./Staff.css"; // Import Staff-specific CSS

const Staff = () => {
  const [step, setStep] = useState(1); // Step state for pagination
  const [selectedCountry, setSelectedCountry] = useState(null); // State for selected country
  const [phoneNumber, setPhoneNumber] = useState(""); // State for phone number
  const [altPhoneNumber, setAltPhoneNumber] = useState(""); // State for alternate phone number
  const [password, setPassword] = useState(""); // State for password
  const [retypePassword, setRetypePassword] = useState(""); // State for retyped password
  const [uploadedDocuments, setUploadedDocuments] = useState([]); // State for uploaded documents

  // Get the list of countries
  const countryOptions = CountryList().getData();

  // Custom styles for react-select
  const customStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: "#ffffff", // White background for input
      color: "#000000", // Black text color
      borderColor: "#cccccc", // Border color
      fontSize: "1rem", // Font size
      boxShadow: "none", // Remove shadow
      "&:hover": {
        borderColor: "#ffd700", // Golden hover effect
      },
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isFocused ? "#ffd700" : isSelected ? "#f6f6f6" : "#ffffff",
      color: isFocused ? "#ffffff" : "#000000", // White text for focused option
      fontSize: "1rem", // Font size
      padding: "10px", // Padding for options
    }),
    singleValue: (base) => ({
      ...base,
      color: "#000000", // Black text color for selected value
    }),
    placeholder: (base) => ({
      ...base,
      color: "#888888", // Grey placeholder text
    }),
  };

  const handleNext = () => {
    setStep(step + 1); // Increment step
  };

  const handleFileUpload = (e) => {
    setUploadedDocuments(Array.from(e.target.files)); // Set uploaded documents
  };

  const handleSubmit = () => {
    alert("Registration Completed!");
  };

  return (
    <div>
      <SignUpHeader /> {/* Header */}
      <div className="staff-signup-body">
        <h1 className="staff-signup-heading">Staff Registration</h1>

        {/* Step 1: Personal Details */}
        {step === 1 && (
          <div className="form-container">
            <label className="form-label">
              First Name
              <input type="text" className="form-input" placeholder="Enter First Name" />
            </label>
            <label className="form-label">
              Last Name
              <input type="text" className="form-input" placeholder="Enter Last Name" />
            </label>
            <label className="form-label">
              Date of Birth
              <input type="date" className="form-input" />
            </label>
            <label className="form-label">
              Gender
              <select className="form-input">
                <option value="" disabled selected>
                  Select Gender
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="form-label">
              Nationality
              <Select
                options={countryOptions}
                value={selectedCountry}
                onChange={setSelectedCountry}
                placeholder="Select your nationality"
                isClearable
                styles={customStyles} // Apply custom styles
                className="country-select"
              />
            </label>
          </div>
        )}

        {/* Step 2: Contact Details */}
        {step === 2 && (
          <div className="form-container">
            <label className="form-label">
              Phone Number
              <PhoneInput
                country={"us"} // Default country
                value={phoneNumber}
                onChange={setPhoneNumber}
                inputStyle={{
                  width: "100%",
                  fontSize: "1rem",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  backgroundColor: "#ffffff", // White background
                }}
                buttonStyle={{
                  backgroundColor: "#ffffff", // White dropdown background
                  border: "1px solid #ccc",
                  borderRadius: "8px 0 0 8px",
                }}
                dropdownStyle={{
                  backgroundColor: "#ffffff", // White dropdown background
                  color: "#000000", // Black text color
                }}
              />
            </label>
            <label className="form-label">
              Alternate Phone Number (Optional)
              <PhoneInput
                country={"us"} // Default country
                value={altPhoneNumber}
                onChange={setAltPhoneNumber}
                inputStyle={{
                  width: "100%",
                  fontSize: "1rem",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  backgroundColor: "#ffffff", // White background
                }}
                buttonStyle={{
                  backgroundColor: "#ffffff", // White dropdown background
                  border: "1px solid #ccc",
                  borderRadius: "8px 0 0 8px",
                }}
                dropdownStyle={{
                  backgroundColor: "#ffffff", // White dropdown background
                  color: "#000000", // Black text color
                }}
              />
            </label>
            <label className="form-label">
              Email
              <input type="email" className="form-input" placeholder="Enter Email" />
            </label>
            <label className="form-label">
              Alternate Email (Optional)
              <input type="email" className="form-input" placeholder="Enter Alternate Email" />
            </label>
            <label className="form-label">
              Upload Aadhar/Passport/PAN Card
              <input
                type="file"
                className="form-input"
                multiple
                onChange={handleFileUpload}
              />
            </label>
            {uploadedDocuments.length > 0 && (
              <ul className="uploaded-files">
                {uploadedDocuments.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Step 3: Company Details */}
        {step === 3 && (
          <div className="form-container">
            <label className="form-label">
              Company/Organisation Associated
              <input
                type="text"
                className="form-input"
                placeholder="Enter Company/Organisation Name"
              />
              <small className="form-note">
                You can only register if your organisation is registered on our platform.
              </small>
            </label>
            <label className="form-label">
              Position at the Company
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Software Engineer, Site Engineer"
              />
            </label>
            <label className="form-label">
              Number of Years Working in the Company
              <input
                type="number"
                className="form-input"
                placeholder="Enter Number of Years"
                min="0"
              />
            </label>
          </div>
        )}

        {/* Step 4: Employee Address */}
        {step === 4 && (
          <div className="form-container">
            <label className="form-label">
              Address Line 1
              <input type="text" className="form-input" placeholder="Enter Address Line 1" />
            </label>
            <label className="form-label">
              Address Line 2 (Optional)
              <input type="text" className="form-input" placeholder="Enter Address Line 2" />
            </label>
            <label className="form-label">
              Pincode
              <input type="text" className="form-input" placeholder="Enter Pincode" />
            </label>
          </div>
        )}

        {/* Step 5: Password Setup */}
        {step === 5 && (
          <div className="form-container">
            <label className="form-label">
              Set your Password
              <input
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <label className="form-label">
              Retype Password
              <input
                type="password"
                className="form-input"
                placeholder="Retype your password"
                value={retypePassword}
                onChange={(e) => setRetypePassword(e.target.value)}
              />
            </label>
            <p className="password-note">
              Password should be longer than 6 characters.
            </p>
          </div>
        )}

        <button
          className="button-17 next-button"
          onClick={step < 5 ? handleNext : handleSubmit}
        >
          {step < 5 ? `Step ${step} of 5` : "Submit"}
        </button>
      </div>
      <HomeFooter /> {/* Footer */}
    </div>
  );
};

export default Staff;
