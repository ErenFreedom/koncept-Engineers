import React from "react";
import Select from "react-select";
import CountryList from "react-select-country-list";
import { useFormData } from "../../context/FormDataContext"; // ✅ Import useFormData for global state

const Step2 = ({ handleNext, step, totalSteps }) => {
  const { formData, setFormData } = useFormData(); // ✅ Use global context for form data

  const countryOptions = CountryList().getData();

  const customStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "#ffffff",
      color: "#000000",
      borderColor: state.isFocused ? "#ffd700" : "#cccccc",
      fontSize: "1rem",
      boxShadow: state.isFocused ? "0 0 5px #ffd700" : "none",
      "&:hover": {
        borderColor: "#ffd700",
      },
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected ? "#ffd700" : isFocused ? "#f6f6f6" : "#ffffff",
      color: "#000000",
      fontSize: "1rem",
      padding: "10px",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#000000",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#ffffff",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#888888",
    }),
  };

  const handleFileUpload = (e) => {
    setFormData({ ...formData, aadhar_pan_passport_s3: Array.from(e.target.files) });
  };

  return (
    <div className="form-container">
      <h2 className="form-heading">Personal Information</h2>

      {/* ✅ Nationality Dropdown */}
      <label className="form-label">
        Nationality
        <Select
          options={countryOptions}
          value={formData.nationality}
          onChange={(selected) => setFormData({ ...formData, nationality: selected?.label || "" })}
          placeholder="Select your nationality"
          isClearable
          styles={customStyles}
          className="country-select"
        />
      </label>

      {/* ✅ Email Field */}
      <label className="form-label">
        Email
        <input
          type="email"
          className="form-input"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </label>

      {/* ✅ Address Fields */}
      <label className="form-label">
        Address 1
        <input
          type="text"
          className="form-input"
          placeholder="Enter Address 1"
          value={formData.address1}
          onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
        />
      </label>
      <label className="form-label">
        Address 2
        <input
          type="text"
          className="form-input"
          placeholder="Enter Address 2"
          value={formData.address2}
          onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
        />
      </label>
      <label className="form-label">
        Pincode
        <input
          type="text"
          className="form-input"
          placeholder="Enter Pincode"
          value={formData.pincode}
          onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
        />
      </label>

      {/* ✅ File Upload */}
      <label className="form-label">
        Upload Aadhar/PAN/Passport
        <input type="file" className="form-input" multiple onChange={handleFileUpload} />
      </label>
      {formData.aadhar_pan_passport_s3 && formData.aadhar_pan_passport_s3.length > 0 && (
        <ul>
          {formData.aadhar_pan_passport_s3.map((file, index) => (
            <li key={index}>{file.name}</li>
          ))}
        </ul>
      )}

      {/* ✅ Next Button */}
      <button className="next-button" onClick={handleNext}>
        Step {step} out of {totalSteps}
      </button>
    </div>
  );
};

export default Step2;
