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
  const [timer, setTimer] = useState(120); 
  const navigate = useNavigate();
  const { formData, setFormData } = useFormData();

  
  useEffect(() => {
    if (!formData || !formData.email || !formData.phone_number) {
      toast.error("Invalid session! Please restart registration.");
      navigate("/Admin");
    }
  }, [formData, navigate]);

  
  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
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

  
  const resendOtp = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/admin/send-otp`, {
        email: formData.email,
        phone_number: formData.phone_number,
      });

      toast.success("OTP Resent Successfully!");
      setTimer(120);
    } catch (error) {
      toast.error("Failed to resend OTP. Try again.");
    }
  };

  
  const registerAdmin = async () => {
    try {
      const finalOtp = otp.join("");
      if (finalOtp.length !== 6) {
        return toast.error("Enter a valid 6-digit OTP.");
      }

     
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          formDataToSend.append(key === "phoneNumber" ? "phone_number" : key, formData[key]);
        }
      });

      
      formDataToSend.append("otp", finalOtp);

      
      ["aadhar", "pan", "gst"].forEach((fileKey) => {
        if (formData[fileKey]) {
          formDataToSend.append(fileKey, formData[fileKey]);
        }
      });

      
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/admin/register`,
        formDataToSend,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success("🎉 Registration Successful! Redirecting to login...");

      
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
