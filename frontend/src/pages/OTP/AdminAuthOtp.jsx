import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AuthHeader from "../../components/AuthPage/AuthHeader";
import { jwtDecode } from "jwt-decode";
import "./Otp.css";

const AdminAuthOtp = () => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timer, setTimer] = useState(120);
  const [isResendActive, setIsResendActive] = useState(false);
  const navigate = useNavigate();
  const storedIdentifier = localStorage.getItem("identifier"); // Get stored identifier

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

  const handleInputChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleVerifyOtp = async () => {
    const finalOtp = otp.join("");
    if (finalOtp.length !== 6) {
      return toast.error("Enter a valid 6-digit OTP.");
    }

    try {
      console.log("🔍 Verifying OTP for:", storedIdentifier);

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/admin/auth/verify-otp`,
        { identifier: storedIdentifier, otp: finalOtp, rememberMe: true },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("✅ OTP Verified Successfully:", response.data);
      toast.success("Login Successful!");

      // ✅ Store token & decode adminId
      localStorage.setItem("adminToken", response.data.accessToken);
      const decodedToken = jwtDecode(response.data.accessToken);
      localStorage.setItem("adminId", decodedToken.adminId);

      // ✅ Navigate to the dashboard using the extracted `adminId`
      navigate(`/Dashboard/${decodedToken.adminId}`);
    } catch (error) {
      console.error("❌ OTP verification failed:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "OTP verification failed");
    }
  };

  return (
    <div>
      <AuthHeader />
      <div className="otp-body">
        <h1 className="otp-heading">Admin OTP Verification</h1>
        <p className="otp-subheading">Enter the OTP sent to your email/phone.</p>

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

        <button className="otp-button" onClick={handleVerifyOtp}>
          Verify OTP ✅
        </button>

        <p className="resend-text">
          Didn't receive an OTP?{" "}
          <span className={`resend-link ${isResendActive ? "active" : ""}`}>
            Resend OTP 🔄
          </span>
        </p>

        <p className="timer-text">
          {timer > 0
            ? `Resend available in ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, "0")}`
            : "You can now resend OTP"}
        </p>
      </div>
    </div>
  );
};

export default AdminAuthOtp;
