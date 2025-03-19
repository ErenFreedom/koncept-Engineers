import React from "react";

const Step1 = ({ formData, setFormData, handleNext, step, totalSteps }) => {
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
        Middle Name (optional)
        <input
          type="text"
          className="form-input"
          placeholder="Enter Middle Name"
          value={formData.middleName}
          onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
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

      <button className="next-button" onClick={handleNext}>
        Step {step} out of {totalSteps}
      </button>
    </div>
  );
};

export default Step1;
