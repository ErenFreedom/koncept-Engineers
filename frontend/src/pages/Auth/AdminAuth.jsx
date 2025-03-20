import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { sendAdminOtp, verifyAdminOtp } from "../../redux/actions/authActions";
import AuthHeader from "../../components/AuthPage/AuthHeader";
import HomeFooter from "../../components/HomePage/HomeFooter";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const AdminAuth = () => {
  const [identifier, setIdentifier] = useState(""); // Can be email or phone
  const [password, setPassword] = useState(""); // Password field
  const [otp, setOtp] = useState(""); // OTP field
  const [otpSent, setOtpSent] = useState(false); // Track OTP status

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // ✅ Send OTP
  // ✅ Send OTP (Fixed)
  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!identifier || !password) {
      toast.error("Please enter both Email/Phone and Password.");
      return;
    }

    try {
      await dispatch(sendAdminOtp(identifier, password)); // ✅ Wait for API response
      localStorage.setItem("identifier", identifier);
      setOtpSent(true); // ✅ Now allow OTP input
    } catch (error) {
      console.error("❌ OTP sending failed:", error);
      toast.error("Failed to send OTP.");
    }
  };



  // ✅ Verify OTP & Authenticate
  // ✅ Verify OTP & Redirect (Fixed)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    try {
      await dispatch(verifyAdminOtp(identifier, otp)); // ✅ Wait for API response

      // ✅ Get `adminId` from local storage after successful verification
      setTimeout(() => {
        const storedAdminId = localStorage.getItem("adminId");
        if (storedAdminId) {
          navigate(`/Dashboard/${storedAdminId}`);
        } else {
          toast.error("Login failed. Please try again.");
        }
      }, 1000);
    } catch (error) {
      console.error("❌ OTP verification failed:", error);
      toast.error("Invalid OTP. Please try again.");
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

              <button className="auth-button" onClick={handleSendOtp} disabled={loading}>
                {loading ? "Sending OTP..." : "Verify"}
              </button>
            </>
          ) : (
            <>
              <label className="form-label">
                Enter OTP
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </label>

              <button className="auth-button" onClick={handleVerifyOtp} disabled={loading}>
                {loading ? "Verifying OTP..." : "Verify OTP"}
              </button>
            </>
          )}
        </div>

        {error && <p className="error-message">{error}</p>}

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
