import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AuthHeader from "../../components/AuthPage/AuthHeader";
import HomeFooter from "../../components/HomePage/HomeFooter";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const AdminAuth = () => {
  const [identifier, setIdentifier] = useState(""); // Email or phone
  const [password, setPassword] = useState(""); // Password field
  const [otpSent, setOtpSent] = useState(false); // Track OTP status
  const navigate = useNavigate();

  // ✅ Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!identifier.trim() || !password.trim()) {
      toast.error("Please enter both Email/Phone and Password.");
      console.error("⚠️ Missing Identifier or Password");
      return;
    }

    try {
      console.log("📩 Sending Request to Backend:", { identifier, password });

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/admin/auth/send-otp`,
        { identifier: identifier.trim(), password: password.trim() },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("✅ OTP Sent Response:", response.data);
      toast.success(`OTP sent to ${identifier}`);

      localStorage.setItem("identifier", identifier.trim());
      setOtpSent(true);
      navigate("/AdminAuthOtp"); // Navigate to OTP page
    } catch (error) {
      console.error("❌ OTP sending failed:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "OTP sending failed");
    }
  };

  return (
    <div>
      <AuthHeader />
      <div className="auth-body">
        <h1 className="auth-heading">Admin Login</h1>
        <div className="form-container">
          {!otpSent ? (
            <>
              <label className="form-label">
                Email or Phone
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your Email or Phone"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </label>

              <label className="form-label">
                Password
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter your Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>

              <button className="auth-button" onClick={handleSendOtp}>
                Send OTP
              </button>
            </>
          ) : (
            <p>OTP has been sent! Please check your email/phone.</p>
          )}
        </div>

        <div className="forgot-password-container">
          <button className="forgot-password-link" onClick={() => alert("Forgot Password functionality coming soon!")}>
            Forgot Password?
          </button>
        </div>
      </div>
      <HomeFooter />
    </div>
  );
};

export default AdminAuth;
