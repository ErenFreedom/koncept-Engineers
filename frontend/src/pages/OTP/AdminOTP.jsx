import React, { useState, useEffect } from "react";
import axios from "axios";
import AuthHeader from "../../components/AuthPage/AuthHeader"; // Header
import "./Otp.css"; // Import CSS

const AdminOtp = ({ formData }) => {
  const [timer, setTimer] = useState(120); // 2 minutes countdown
  const [otp, setOtp] = useState(Array(6).fill("")); // 6-digit OTP

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

  const handleInputChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
  };

  const handleKeyPress = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  const verifyOtpAndRegister = async () => {
    try {
      const finalOtp = otp.join(""); // Convert OTP array to a single string
      if (finalOtp.length !== 6) {
        return alert("Please enter a valid 6-digit OTP.");
      }

      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      formDataToSend.append("otp", finalOtp);
      formDataToSend.append("aadhar", formData.aadhar);
      formDataToSend.append("pan", formData.pan);
      formDataToSend.append("gst", formData.gst);

      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/admin/register`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Registration Successful! Redirecting to login.");
      window.location.href = "/admin/login"; // Redirect after success
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert(error.response?.data?.message || "OTP verification failed.");
    }
  };

  return (
    <div>
      <AuthHeader /> {/* Header */}
      <div className="otp-body">
        <h1 className="otp-heading">Admin OTP Verification</h1>
        <p className="otp-instructions">Enter the OTP sent to your registered email.</p>
        <img src="/Otp.png" alt="OTP Illustration" className="otp-image" />
        <div className="otp-input-container">
          {otp.map((value, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              className="otp-box"
              value={value}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, index)}
              id={`otp-input-${index}`}
            />
          ))}
        </div>
        <button className="otp-button" onClick={verifyOtpAndRegister}>Verify OTP</button>
        <p className="resend-otp">
          {timer > 0 ? (
            `Resend OTP in ${Math.floor(timer / 60)}:${timer % 60 < 10 ? "0" : ""}${timer % 60}`
          ) : (
            <button className="resend-button" onClick={() => alert("Resend OTP feature not implemented yet.")}>
              Resend
            </button>
          )}
        </p>
      </div>
    </div>
  );
};

export default AdminOtp;
