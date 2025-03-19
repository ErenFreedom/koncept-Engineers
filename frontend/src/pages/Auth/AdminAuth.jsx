import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginAdmin } from "../../redux/actions/authActions";
import AuthHeader from "../../components/AuthPage/AuthHeader";
import HomeFooter from "../../components/HomePage/HomeFooter";
import "./Auth.css";

const AdminAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(loginAdmin(email, password));
  };

  return (
    <div>
      <AuthHeader />
      <div className="auth-body">
        <h1 className="auth-heading">Admin Login</h1>
        <div className="form-container">
          <label className="form-label">
            Email
            <input
              type="email"
              className="form-input"
              placeholder="Enter your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
        </div>

        <button className="auth-button" onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

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
