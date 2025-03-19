import React, { useState, useEffect } from "react";
import AuthHeader from "../../components/AuthPage/AuthHeader";
import "./Otp.css";

const AdminAuthOtp = () => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timer, setTimer] = useState(120);
  const [isResendActive, setIsResendActive] = useState(false);

  // ✅ OTP Countdown Timer
  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    } else {
      setIsResendActive(true); // Enable resend OTP
    }
  }, [timer]);

  // ✅ Handle OTP Input
  const handleInputChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < otp.length - 1) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  return (
    <div>
      <AuthHeader />
      <div className="otp-body">
        <h1 className="otp-heading">Admin OTP Verification</h1>
        <p className="otp-subheading">Enter the OTP sent to your email/phone.</p>

        {/* OTP Input Boxes */}
        <div className="otp-input-container">
          {otp.map((value, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              className="otp-box"
              value={value}
              onChange={(e) => handleInputChange(index, e.target.value)}
              id={`otp-input-${index}`}
            />
          ))}
        </div>

        <button className="otp-button">Verify OTP ✅</button>

        {/* Resend OTP Section */}
        <p className="resend-text">
          Didn't receive an OTP?{" "}
          <span
            className={`resend-link ${isResendActive ? "active" : ""}`}
          >
            Resend OTP 🔄
          </span>
        </p>

        {/* Timer Text */}
        <p className="timer-text">
          {timer > 0 ? `Resend available in ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, "0")}` : "You can now resend OTP"}
        </p>
      </div>
    </div>
  );
};

export default AdminAuthOtp;
