import React from "react";
import Select from "react-select";
import CountryList from "react-select-country-list";

const Step1 = ({ formData, setFormData, handleNext, step, totalSteps }) => {
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

  return (
    <div className="form-container">
      <label className="form-label">
        First Name
        <input
          type="text"
          className="form-input"
          placeholder="Enter First Name"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
        />
      </label>
      <label className="form-label">
        Last Name
        <input
          type="text"
          className="form-input"
          placeholder="Enter Last Name"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
        />
      </label>
      <label className="form-label">
        Date of Birth
        <input
          type="date"
          className="form-input"
          value={formData.dob}
          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
        />
      </label>
      <label className="form-label">
        Gender
        <select
          className="form-input"
          value={formData.gender}
          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
        >
          <option value="" disabled>Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label className="form-label">
        Nationality
        <Select
          options={countryOptions}
          value={formData.nationality}
          onChange={(selected) => setFormData({ ...formData, nationality: selected })}
          placeholder="Select your nationality"
          isClearable
          styles={customStyles}
          className="country-select"
        />
      </label>

      <button className="next-button" onClick={handleNext}>
        Step {step} out of {totalSteps}
      </button>
    </div>
  );
};

export default Step1;
