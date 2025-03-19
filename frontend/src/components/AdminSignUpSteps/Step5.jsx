import React from "react";
import axios from "axios";

const Step5 = ({ formData, setFormData, handleNext, step, totalSteps }) => {
  const sendOtp = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/admin/send-otp`, {
        identifier: formData.email, // Send OTP to admin's email
      });
      alert("OTP has been sent to your email.");
      handleNext(); // Move to OTP verification step
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert(error.response?.data?.message || "Failed to send OTP. Try again.");
    }
  };

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

      <button className="next-button" onClick={sendOtp}>
        Step {step} out of {totalSteps} ✅
      </button>
    </div>
  );
};

export default Step5;
