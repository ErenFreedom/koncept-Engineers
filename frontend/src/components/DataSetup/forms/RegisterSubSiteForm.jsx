import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../../context/AuthContext";
import { sendSubSiteOtp, registerSubSite } from "../../../redux/actions/subsiteActions";
import "./FormStyles.css";

const RegisterSubSiteForm = ({ setDropdownAction }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();

  const [phase, setPhase] = useState("register"); 
  const [formData, setFormData] = useState({
    adminEmail: "",
    adminPhone: "",
    otpMethod: "email",
    siteName: "",
    siteEmail: "",
    siteAltEmail: "",
    siteAddress1: "",
    siteAddress2: "",
    sitePincode: "",
    sitePanS3: "",
    siteGstS3: "",
  });
  const [otp, setOtp] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    await dispatch(sendSubSiteOtp(formData, accessToken));
    setPhase("otp");
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const finalData = { ...formData, otp };
    await dispatch(registerSubSite(finalData, accessToken));
    setPhase("success");
    setDropdownAction(null); // ✅ reset dropdown
  };

  return (
    <form className="form-container" onSubmit={phase === "otp" ? handleOtpSubmit : handleRegister}>
      {phase === "register" && (
        <>
          <h3>Register Sub-Site</h3>
          <input name="adminEmail" value={formData.adminEmail} onChange={handleChange} placeholder="Admin Email" />
          <input name="adminPhone" value={formData.adminPhone} onChange={handleChange} placeholder="Admin Phone" />
          <select name="otpMethod" value={formData.otpMethod} onChange={handleChange}>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
          </select>
          <input name="siteName" value={formData.siteName} onChange={handleChange} placeholder="Site Name" />
          <input name="siteEmail" value={formData.siteEmail} onChange={handleChange} placeholder="Site Email" />
          <input name="siteAltEmail" value={formData.siteAltEmail} onChange={handleChange} placeholder="Alt Email" />
          <input name="siteAddress1" value={formData.siteAddress1} onChange={handleChange} placeholder="Address Line 1" />
          <input name="siteAddress2" value={formData.siteAddress2} onChange={handleChange} placeholder="Address Line 2" />
          <input name="sitePincode" value={formData.sitePincode} onChange={handleChange} placeholder="Pincode" />
          <input name="sitePanS3" value={formData.sitePanS3} onChange={handleChange} placeholder="PAN (optional)" />
          <input name="siteGstS3" value={formData.siteGstS3} onChange={handleChange} placeholder="GST (optional)" />
          <button type="submit">Send OTP</button>
        </>
      )}

      {phase === "otp" && (
        <>
          <h3>Enter OTP</h3>
          <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="OTP" />
          <button type="submit">Verify & Register</button>
        </>
      )}

      {phase === "success" && (
        <div className="success-message">
          ✅ Sub-site registered successfully!
        </div>
      )}
    </form>
  );
};

export default RegisterSubSiteForm;
