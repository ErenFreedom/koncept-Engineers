import React, { useEffect } from "react";
import Select from "react-select";
import CountryList from "react-select-country-list";
import { useFormData } from "../../context/FormDataContext"; // ✅ Import global state

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
    setFormData((prev) => ({
      ...prev,
      aadhar_pan_passport_s3: Array.from(e.target.files),
    }));
  };

  // ✅ Ensure formData persists between steps
  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      nationality: prevData.nationality || "",
      email: prevData.email || "",
      address1: prevData.address1 || "",
      address2: prevData.address2 || "",
      pincode: prevData.pincode || "",
      aadhar_pan_passport_s3: prevData.aadhar_pan_passport_s3 || null,
    }));
  }, [setFormData]);

  return (
    <div className="form-container">
      <h2 className="form-heading">Personal Information</h2>

      {/* ✅ Nationality Dropdown */}
      <label className="form-label">
        Nationality
        <Select
          options={countryOptions}
          value={countryOptions.find((option) => option.label === formData.nationality) || null} // ✅ Fix for selection issue
          onChange={(selected) => setFormData((prev) => ({
            ...prev,
            nationality: selected ? selected.label : "",
          }))}
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
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          required
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
          onChange={(e) => setFormData((prev) => ({ ...prev, address1: e.target.value }))}
          required
        />
      </label>
      <label className="form-label">
        Address 2
        <input
          type="text"
          className="form-input"
          placeholder="Enter Address 2"
          value={formData.address2}
          onChange={(e) => setFormData((prev) => ({ ...prev, address2: e.target.value }))}
        />
      </label>
      <label className="form-label">
        Pincode
        <input
          type="text"
          className="form-input"
          placeholder="Enter Pincode"
          value={formData.pincode}
          onChange={(e) => setFormData((prev) => ({ ...prev, pincode: e.target.value }))}
          required
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
