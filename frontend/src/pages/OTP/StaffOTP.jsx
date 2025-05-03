import React, { useState, useEffect } from "react";
import AuthHeader from "../../components/AuthPage/AuthHeader"; 
import HomeFooter from "../../components/HomePage/HomeFooter"; 
import "./Otp.css"; 

const StaffOtp = () => {
  const [timer, setTimer] = useState(120); 
  const [otp, setOtp] = useState(Array(6).fill("")); 

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

  const handleResend = () => {
    setTimer(120); 
    alert("OTP Resent!");
  };

  return (
    <div>
      <AuthHeader /> 
      <div className="otp-body">
        <h1 className="otp-heading">Staff OTP Verification</h1>
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
        <button className="otp-button">Verify OTP</button>
        <p className="resend-otp">
          {timer > 0 ? (
            `Resend OTP in ${Math.floor(timer / 60)}:${timer % 60 < 10 ? "0" : ""}${timer % 60}`
          ) : (
            <button className="resend-button" onClick={handleResend}>
              Resend
            </button>
          )}
        </p>
      </div>
      <HomeFooter /> 
    </div>
  );
};

export default StaffOtp;
