import React from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const Step5 = ({ formData, setFormData, handleNext, step, totalSteps }) => {
  const navigate = useNavigate();

  const sendOtp = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}api/admin/send-otp`, {
        identifier: formData.email, // Send OTP to admin's email
      });

      toast.success("OTP sent to your registered email. Redirecting...");
      setTimeout(() => {
        navigate("/AdminOtp"); // Redirect to OTP page
      }, 2000);
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error(error.response?.data?.message || "Failed to send OTP. Try again.");
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
