import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useFormData } from "../../context/FormDataContext"; // ✅ Import global state

import "react-toastify/dist/ReactToastify.css";

const Step5 = ({ handleNext, step, totalSteps }) => {
  const navigate = useNavigate();
  const { formData, setFormData } = useFormData(); // ✅ Use global context
  const [otpMethod, setOtpMethod] = useState(""); // ✅ Store selected OTP method

  // ✅ Ensure required data exists in context before proceeding
  useEffect(() => {
    const savedFormData = localStorage.getItem("formData");
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData));
    }

    if (!formData.email || !formData.phone_number) {
      toast.error("Session expired! Please restart registration.");
      navigate("/"); // Redirect to start if data is missing
    }

    console.log("🔍 Step 5 FormData (Loaded from LocalStorage):", formData); // ✅ Debugging
  }, [setFormData, formData.email, formData.phone_number, navigate]);

  // ✅ Send OTP request
  const sendOtp = async () => {
    if (!otpMethod) {
      toast.error("Please select a method to receive OTP (Email or Phone).");
      return;
    }

    if (!formData.email || !formData.phone_number) {
      toast.error("Missing required fields! Please restart the registration.");
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/admin/send-otp`, {
        email: formData.email,
        phone_number: formData.phone_number, // ✅ Ensure phone_number is correct
        otp_method: otpMethod, // ✅ Ensure OTP method is sent correctly
      });

      toast.success(`OTP sent to your registered ${otpMethod}. Redirecting...`);
      setTimeout(() => {
        navigate("/AdminOtp"); // ✅ Redirect to OTP verification page
      }, 2000);
    } catch (error) {
      console.error("❌ Error sending OTP:", error);
      toast.error(error.response?.data?.message || "Failed to send OTP. Try again.");
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
          onChange={(e) => {
            const updatedData = { ...formData, password: e.target.value };
            setFormData(updatedData);
            localStorage.setItem("formData", JSON.stringify(updatedData)); // ✅ Persist password in LocalStorage
          }}
        />
      </label>
      <label className="form-label">
        Retype Password
        <input
          type="password"
          className="form-input"
          placeholder="Retype your password"
          value={formData.retypePassword}
          onChange={(e) => {
            const updatedData = { ...formData, retypePassword: e.target.value };
            setFormData(updatedData);
            localStorage.setItem("formData", JSON.stringify(updatedData)); // ✅ Persist retyped password
          }}
        />
      </label>
      <p className="password-note">Password should be longer than 6 characters.</p>

      {/* ✅ OTP Verification Section */}
      <h3 className="otp-heading">Verify Your Account</h3>
      <p className="otp-instructions">Choose where to receive your OTP for verification.</p>

      <div className="otp-checkbox-container">
        <label className="otp-checkbox-label">
          <input
            type="radio"
            className="otp-checkbox-input"
            checked={otpMethod === "email"}
            onChange={() => setOtpMethod("email")}
          />
          Send OTP to Email ({formData.email})
        </label>
        <label className="otp-checkbox-label">
          <input
            type="radio"
            className="otp-checkbox-input"
            checked={otpMethod === "phone"}
            onChange={() => setOtpMethod("phone")}
          />
          Send OTP to Phone ({formData.phone_number}) {/* ✅ Match backend key */}
        </label>
      </div>

      <button className="next-button" onClick={sendOtp}>
        Send OTP & Verify ✅
      </button>
    </div>
  );
};

export default Step5;
