import React from "react";

const Step4 = ({ formData, setFormData, handleNext, step, totalSteps }) => {
  return (
    <div className="form-container">
      <label className="form-label">
        Company Address 1
        <input
          type="text"
          className="form-input"
          placeholder="Enter Company Address Line 1"
          value={formData.companyAddress1}
          onChange={(e) => setFormData({ ...formData, companyAddress1: e.target.value })}
        />
      </label>
      <label className="form-label">
        Company Address 2
        <input
          type="text"
          className="form-input"
          placeholder="Address Line 2"
          value={formData.companyAddress2}
          onChange={(e) => setFormData({ ...formData, companyAddress2: e.target.value })}
        />
      </label>
      <label className="form-label">
        Pincode
        <input
          type="text"
          className="form-input"
          placeholder="Enter Pincode"
          value={formData.companyPincode}
          onChange={(e) => setFormData({ ...formData, companyPincode: e.target.value })}
        />
      </label>

      <button className="next-button" onClick={handleNext}>
        Step {step} out of {totalSteps}
      </button>
    </div>
  );
};

export default Step4;
