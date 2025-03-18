import React, { useState } from "react";
import SignUpHeader from "../../components/SignUpPage/SignUpHeader"; // Importing the header
import HomeFooter from "../../components/HomePage/HomeFooter"; // Importing the footer
import CountryList from "react-select-country-list"; // Import country list
import Select from "react-select"; // Import react-select
import PhoneInput from "react-phone-input-2"; // Import react-phone-input-2
import "react-phone-input-2/lib/style.css"; // Styles for phone input
import "./Admin.css"; // Import Admin-specific CSS

const Admin = () => {
  const [step, setStep] = useState(1); // Step state for pagination
  const [selectedCountry, setSelectedCountry] = useState(null); // State for selected country
  const [phoneNumber, setPhoneNumber] = useState(""); // State for phone number
  const [password, setPassword] = useState(""); // State for password
  const [retypePassword, setRetypePassword] = useState(""); // State for retyped password
  const [aadharPanPassport, setAadharPanPassport] = useState([]); // State for uploaded documents
  const [companyPan, setCompanyPan] = useState([]); // State for Company's PAN Card
  const [companyGst, setCompanyGst] = useState([]); // State for Company's GST

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

  const handleFileUpload = (e, setter) => {
    setter(Array.from(e.target.files)); // Set uploaded files to the state
  };

  return (
    <div>
      <SignUpHeader /> {/* Header */}
      <div className="admin-signup-body">
        <h1 className="admin-signup-heading">Admin Registration</h1>

        {/* Step 1: Personal Details */}
        {step === 1 && (
          <div className="form-container">
            <label className="form-label">
              First Name
              <input type="text" className="form-input" placeholder="Enter First Name" />
            </label>
            <label className="form-label">
              Middle Name (optional)
              <input type="text" className="form-input" placeholder="Enter Middle Name" />
            </label>
            <label className="form-label">
              Last Name
              <input type="text" className="form-input" placeholder="Enter Last Name" />
            </label>
            <label className="form-label">
              Date of Birth
              <input type="date" className="form-input" />
            </label>
          </div>
        )}

        {/* Step 2: Address Details */}
        {step === 2 && (
          <div className="form-container">
            <label className="form-label">
              Nationality
              <Select
                options={countryOptions}
                value={selectedCountry}
                onChange={setSelectedCountry}
                placeholder="Select your nationality"
                isClearable
                styles={customStyles}
                className="country-select"
              />
            </label>
            <label className="form-label">
              Address 1
              <input type="text" className="form-input" placeholder="Enter Address 1" />
            </label>
            <label className="form-label">
              Address 2
              <input type="text" className="form-input" placeholder="Enter Address 2" />
            </label>
            <label className="form-label">
              Pincode
              <input type="text" className="form-input" placeholder="Enter Pincode" />
            </label>
            <label className="form-label" style={{ display: step === 2 ? "block" : "none" }}>
              Upload Aadhar/PAN/Passport
              <input
                type="file"
                className="form-input"
                multiple
                onChange={(e) => handleFileUpload(e, setAadharPanPassport)}
              />
            </label>

            {aadharPanPassport.length > 0 && (
              <ul>
                {aadharPanPassport.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Step 3: Contact Details */}
        {step === 3 && (
          <div className="form-container">
            <label className="form-label">
              Phone Number
              <PhoneInput
                country={"us"}
                value={phoneNumber}
                onChange={setPhoneNumber}
                inputStyle={{
                  width: "100%",
                  fontSize: "1rem",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  backgroundColor: "#ffffff",
                }}
                buttonStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #ccc",
                  borderRadius: "8px 0 0 8px",
                }}
                dropdownStyle={{
                  backgroundColor: "#ffffff",
                  color: "#000000",
                }}
              />
            </label>
            <label className="form-label">
              Landline (Optional)
              <input type="text" className="form-input" placeholder="Enter Landline Number" />
            </label>
            <label className="form-label">
              Company/Organisation Name
              <input type="text" className="form-input" placeholder="Enter Company Name" />
            </label>
            <label className="form-label">
              Upload Company's PAN Card
              <input
                type="file"
                className="form-input"
                multiple
                onChange={(e) => handleFileUpload(e, setCompanyPan)}
              />
            </label>
            {companyPan.length > 0 && (
              <ul>
                {companyPan.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            )}
            <label className="form-label">
              Upload Company's GST
              <input
                type="file"
                className="form-input"
                multiple
                onChange={(e) => handleFileUpload(e, setCompanyGst)}
              />
            </label>
            {companyGst.length > 0 && (
              <ul>
                {companyGst.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Step 4: Company's Address */}
        {step === 4 && (
          <div className="form-container">
            <label className="form-label">
              Company Address 1
              <input type="text" className="form-input" placeholder="Enter Company Address Line 1" />
            </label>
            <label className="form-label">
              Company Address 2
              <input type="text" className="form-input" placeholder="Address Line 2" />
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
          onClick={handleNext}
          disabled={step === 5}
        >
          Step {step} of 5
        </button>
      </div>
      <HomeFooter /> {/* Footer */}
    </div>
  );
};

export default Admin;
