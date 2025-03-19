import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useFormData } from "../../context/FormDataContext";
import AuthHeader from "../../components/AuthPage/AuthHeader";
import "react-toastify/dist/ReactToastify.css";
import "./Otp.css";

const AdminOtp = () => {
  const [otp, setOtp] = useState(Array(6).fill("")); // 6-digit OTP
  const [timer, setTimer] = useState(120); // 2-minute countdown
  const navigate = useNavigate();
  const { formData, setFormData } = useFormData();

  // ✅ Ensure `formData` is properly loaded before checking for missing fields
  useEffect(() => {
    if (!formData || !formData.email || !formData.phone_number) {
      toast.error("Invalid session! Please restart registration.");
      navigate("/Admin");
    }
  }, [formData, navigate]);

  // ✅ OTP Countdown Timer
  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
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

  // ✅ Handle OTP Resend
  const resendOtp = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/admin/send-otp`, {
        email: formData.email,
        phone_number: formData.phone_number,
      });

      toast.success("OTP Resent Successfully!");
      setTimer(120); // Reset 2-minute timer
    } catch (error) {
      toast.error("Failed to resend OTP. Try again.");
    }
  };

  // ✅ Register Admin After OTP Verification
  const registerAdmin = async () => {
    try {
      const finalOtp = otp.join("");
      if (finalOtp.length !== 6) {
        return toast.error("Enter a valid 6-digit OTP.");
      }

      // ✅ Create form data object
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          formDataToSend.append(key === "phoneNumber" ? "phone_number" : key, formData[key]);
        }
      });

      // ✅ Append OTP to request
      formDataToSend.append("otp", finalOtp);

      // ✅ Append Files (Aadhar, PAN, GST)
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

      // ✅ CLEAR Local Storage & Form Data after successful registration
      localStorage.removeItem("formData");
      setFormData({});

      setTimeout(() => {
        navigate("/AuthAdmin");
      }, 2000);
    } catch (error) {
      console.error("❌ Error verifying OTP & Registering:", error);
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

        <button className="otp-button" onClick={registerAdmin}>Verify OTP & Register ✅</button>

        {/* ✅ Resend OTP Timer */}
        <p className="resend-otp">
          {timer > 0 ? (
            `Resend OTP in ${Math.floor(timer / 60)}:${timer % 60 < 10 ? "0" : ""}${timer % 60}`
          ) : (
            <button className="resend-button" onClick={resendOtp}>
              Resend OTP 🔄
            </button>
          )}
        </p>
      </div>
    </div>
  );
};

export default AdminOtp;
