import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useFormData } from "../../context/FormDataContext";
import AuthHeader from "../../components/AuthPage/AuthHeader";
import "react-toastify/dist/ReactToastify.css";
import "./Otp.css";

const AdminOtp = () => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const navigate = useNavigate();
  const { formData } = useFormData();

  // ✅ Prevent access if formData is missing
  useEffect(() => {
    if (!formData || !formData.email || !formData.phone_number) {
      toast.error("Invalid session! Please restart registration.");
      navigate("/Admin");
    }
  }, [formData, navigate]);

  // ✅ Handle OTP Input
  const handleInputChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < otp.length - 1) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const verifyOtpAndRegister = async () => {
    try {
      const finalOtp = otp.join("");
      if (finalOtp.length !== 6) {
        return toast.error("Enter a valid 6-digit OTP.");
      }

      // ✅ Step 1: Verify OTP
      const otpResponse = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/admin/verify-otp`, {
        email: formData.email,
        phone_number: formData.phone_number,
        otp: finalOtp,
      });

      if (otpResponse.status !== 200) {
        return toast.error("Invalid OTP. Try again.");
      }

      toast.success("✅ OTP Verified! Registering...");

      // ✅ Step 2: Send Full Data (cURL-like Request)
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          formDataToSend.append(key === "phoneNumber" ? "phone_number" : key, formData[key]);
        }
      });

      ["aadhar", "pan", "gst"].forEach((fileKey) => {
        if (formData[fileKey]) {
          formDataToSend.append(fileKey, formData[fileKey]);
        }
      });

      // ✅ Send Registration Request
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/admin/register`,
        formDataToSend,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success("🎉 Registration Successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/AuthAdmin");
      }, 2000);
    } catch (error) {
      console.error("❌ Error verifying OTP:", error);
      toast.error(error.response?.data?.message || "OTP verification failed.");
    }
  };

  return (
    <div>
      <AuthHeader />
      <div className="otp-body">
        <h1 className="otp-heading">Admin OTP Verification</h1>
        <p className="otp-instructions">Enter the OTP sent to your email/phone.</p>
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
        <button className="otp-button" onClick={verifyOtpAndRegister}>Verify OTP & Register ✅</button>
      </div>
    </div>
  );
};

export default AdminOtp;
