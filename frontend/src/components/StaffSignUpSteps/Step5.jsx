import React from "react";

const Step5 = ({ formData, setFormData, step, totalSteps }) => {
  return (
    <div className="form-container">
      <label className="form-label">
        Set your Password
        <input
          type="password"
          className="form-input"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
      </label>
      <label className="form-label">
        Retype Password
        <input
          type="password"
          className="form-input"
          placeholder="Retype your password"
          value={formData.retypePassword}
          onChange={(e) => setFormData({ ...formData, retypePassword: e.target.value })}
        />
      </label>
      <p className="password-note">
        Password should be longer than 6 characters.
      </p>

      <button className="next-button" disabled>
        Registration Complete ✅
      </button>
    </div>
  );
};

export default Step5;
