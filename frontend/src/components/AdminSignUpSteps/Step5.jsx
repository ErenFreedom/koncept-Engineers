import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useFormData } from "../../context/FormDataContext";

import "react-toastify/dist/ReactToastify.css";

const Step5 = ({ step, totalSteps }) => {
  const navigate = useNavigate();
  const { formData, setFormData } = useFormData();
  const [otpMethod, setOtpMethod] = useState("");

  
  const sendOtp = async () => {
    if (!otpMethod) {
      toast.error("Please select Email or Phone for OTP.");
      return;
    }

    if (!formData.email && otpMethod === "email") {
      toast.error("Email is missing. Please enter a valid email.");
      return;
    }

    if (!formData.phone_number && otpMethod === "phone") {
      toast.error("Phone number is missing. Please enter a valid phone number.");
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/admin/send-otp`, {
        email: formData.email,
        phone_number: formData.phone_number,
        otp_method: otpMethod,
      });

      toast.success(`OTP sent to your ${otpMethod}. Redirecting to OTP page...`);
      setTimeout(() => {
        navigate("/AdminOtp");
      }, 2000);
    } catch (error) {
      console.error("❌ Error sending OTP:", error);
      toast.error(error.response?.data?.message || "Failed to send OTP.");
    }
  };


  return (
    <div className="form-container">
      <h2 className="form-heading">Secure Your Account</h2>

      {/* ✅ Password Fields */}
      <label className="form-label">
        Set your Password
        <input
          type="password"
          className="form-input"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
        />
      </label>
      <label className="form-label">
        Retype Password
        <input
          type="password"
          className="form-input"
          placeholder="Retype your password"
          value={formData.retypePassword}
          onChange={(e) => setFormData((prev) => ({ ...prev, retypePassword: e.target.value }))}
        />
      </label>

      
      <h3 className="otp-heading">Verify Your Account</h3>
      <p className="otp-instructions">Choose where to receive your OTP.</p>

      <div className="otp-checkbox-container">
        <label className="otp-checkbox-label">
          <input
            type="radio"
            name="otpMethod"
            checked={otpMethod === "email"}
            onChange={() => setOtpMethod("email")}
          />
          Send OTP to Email ({formData.email || "Not Provided"})
        </label>
        <label className="otp-checkbox-label">
          <input
            type="radio"
            name="otpMethod"
            checked={otpMethod === "phone"}
            onChange={() => setOtpMethod("phone")}
          />
          Send OTP to Phone ({formData.phone_number || "Not Provided"})
        </label>
      </div>


      <button className="next-button" onClick={sendOtp}>Send OTP ✅</button>
    </div>
  );
};

export default Step5;
