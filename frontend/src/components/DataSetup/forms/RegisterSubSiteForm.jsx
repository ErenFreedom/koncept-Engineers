import React, { useState } from "react";
import "./FormStyles.css";

const RegisterSubSiteForm = () => {
  const [formData, setFormData] = useState({
    adminEmail: "",
    adminPhone: "",
    otpMethod: "email",
    otp: "",
    siteName: "",
    siteEmail: "",
    siteAltEmail: "",
    siteAddress1: "",
    siteAddress2: "",
    sitePincode: "",
    sitePanS3: "",
    siteGstS3: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Dispatch to Redux later
    console.log("Submitting SubSite:", formData);
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>Register Sub-Site</h3>

      <input name="adminEmail" value={formData.adminEmail} onChange={handleChange} placeholder="Admin Email" />
      <input name="adminPhone" value={formData.adminPhone} onChange={handleChange} placeholder="Admin Phone" />

      <select name="otpMethod" value={formData.otpMethod} onChange={handleChange}>
        <option value="email">Email</option>
        <option value="phone">Phone</option>
      </select>

      <input name="otp" value={formData.otp} onChange={handleChange} placeholder="OTP" />

      <input name="siteName" value={formData.siteName} onChange={handleChange} placeholder="Site Name" />
      <input name="siteEmail" value={formData.siteEmail} onChange={handleChange} placeholder="Site Email" />
      <input name="siteAltEmail" value={formData.siteAltEmail} onChange={handleChange} placeholder="Alt Email" />
      <input name="siteAddress1" value={formData.siteAddress1} onChange={handleChange} placeholder="Address Line 1" />
      <input name="siteAddress2" value={formData.siteAddress2} onChange={handleChange} placeholder="Address Line 2" />
      <input name="sitePincode" value={formData.sitePincode} onChange={handleChange} placeholder="Pincode" />
      <input name="sitePanS3" value={formData.sitePanS3} onChange={handleChange} placeholder="PAN (optional)" />
      <input name="siteGstS3" value={formData.siteGstS3} onChange={handleChange} placeholder="GST (optional)" />

      <button type="submit">Register Sub-Site</button>
    </form>
  );
};

export default RegisterSubSiteForm;
