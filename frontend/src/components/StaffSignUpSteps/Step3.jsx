import React from "react";

const Step3 = ({ formData, setFormData, handleNext, step, totalSteps }) => {
  return (
    <div className="form-container">
      <label className="form-label">
        Company/Organisation Associated
        <input
          type="text"
          className="form-input"
          placeholder="Enter Company/Organisation Name"
          value={formData.companyName}
          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
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
          value={formData.position}
          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
        />
      </label>
      <label className="form-label">
        Number of Years Working in the Company
        <input
          type="number"
          className="form-input"
          placeholder="Enter Number of Years"
          min="0"
          value={formData.yearsWorking}
          onChange={(e) => setFormData({ ...formData, yearsWorking: e.target.value })}
        />
      </label>

      <button className="next-button" onClick={handleNext}>
        Step {step} out of {totalSteps}
      </button>
    </div>
  );
};

export default Step3;
