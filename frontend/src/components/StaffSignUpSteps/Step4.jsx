import React from "react";

const Step4 = ({ formData, setFormData, handleNext, step, totalSteps }) => {
  return (
    <div className="form-container">
      <label className="form-label">
        Address Line 1
        <input
          type="text"
          className="form-input"
          placeholder="Enter Address Line 1"
          value={formData.address1}
          onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
        />
      </label>
      <label className="form-label">
        Address Line 2 (Optional)
        <input
          type="text"
          className="form-input"
          placeholder="Enter Address Line 2"
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

      <button className="next-button" onClick={handleNext}>
        Step {step} out of {totalSteps}
      </button>
    </div>
  );
};

export default Step4;
