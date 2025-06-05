import React from "react";
import Select from "react-select";
import CountryList from "react-select-country-list";
import { useFormData } from "../../context/FormDataContext"; 

const Step2 = ({ handleNext, step, totalSteps }) => {
  const { formData, setFormData } = useFormData(); 
  const countryOptions = CountryList().getData();

  const customStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "#ffffff",
      borderColor: state.isFocused ? "#ffd700" : "#cccccc",
      fontSize: "1rem",
      boxShadow: state.isFocused ? "0 0 5pxrgb(51, 34, 159)" : "none",
      "&:hover": { borderColor: "#ffd700" },
    }),
  };

  const handleFileUpload = (e) => {
    setFormData({ ...formData, aadhar_pan_passport_s3: Array.from(e.target.files).map((file) => file.name) });
  };

  return (
    <div className="form-container">
      <h2 className="form-heading">Personal Information</h2>

      
      <label className="form-label">
        Nationality
        <Select
          options={countryOptions}
          value={countryOptions.find((option) => option.label === formData.nationality) || null}
          onChange={(selected) => setFormData({ ...formData, nationality: selected ? selected.label : "" })}
          placeholder="Select your nationality"
          isClearable
          styles={customStyles}
          className="country-select"
        />
      </label>

      
      <label className="form-label">
        Email
        <input
          type="email"
          className="form-input"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </label>

      
      <label className="form-label">
        Address 1
        <input
          type="text"
          className="form-input"
          placeholder="Enter Address 1"
          value={formData.address1}
          onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
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
          required
        />
      </label>

      
      <label className="form-label">
        Upload Aadhar/PAN/Passport
        <input type="file" className="form-input" multiple onChange={handleFileUpload} />
      </label>
      {formData.aadhar_pan_passport_s3 && formData.aadhar_pan_passport_s3.length > 0 && (
        <ul>
          {formData.aadhar_pan_passport_s3.map((file, index) => (
            <li key={index}>{file}</li>
          ))}
        </ul>
      )}

      
      <button className="next-button" onClick={handleNext}>
        Step {step} out of {totalSteps}
      </button>
    </div>
  );
};

export default Step2;
