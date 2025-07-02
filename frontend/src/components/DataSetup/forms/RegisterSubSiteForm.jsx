import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../../context/AuthContext";
import { sendSubSiteOtp, registerSubSite, editSubSiteInfo } from "../../../redux/actions/subsiteActions";
import "./FormStyles.css";

const RegisterSubSiteForm = ({ data, setDropdownAction }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();

  const [phase, setPhase] = useState(data ? "success" : "register"); // if editing, start in success phase
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    adminEmail: data?.adminEmail || "",
    adminPhone: data?.adminPhone || "",
    otpMethod: data?.otpMethod || "email",
    siteName: data?.siteName || "",
    siteEmail: data?.siteEmail || "",
    siteAltEmail: data?.siteAltEmail || "",
    siteAddress1: data?.siteAddress1 || "",
    siteAddress2: data?.siteAddress2 || "",
    sitePincode: data?.sitePincode || "",
    sitePanS3: data?.sitePanS3 || "",
    siteGstS3: data?.siteGstS3 || "",
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
    setDropdownAction(null); // ✅ reset dropdown on success
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await dispatch(editSubSite(formData, accessToken)); // ✅ call your edit redux action
    setIsEditing(false);
    setDropdownAction(null);
  };

  return (
    <form
      className="form-container"
      onSubmit={
        phase === "otp"
          ? handleOtpSubmit
          : phase === "success" && isEditing
          ? handleEditSubmit
          : handleRegister
      }
    >
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
          <input name="siteAltEmail" value={formData.siteAltEmail} onChange={handleChange} placeholder="Alternate Email" />
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
        <>
          <h3>Sub-site Info</h3>
          <input name="siteName" value={formData.siteName} onChange={handleChange} placeholder="Site Name" readOnly={!isEditing} />
          <input name="siteEmail" value={formData.siteEmail} onChange={handleChange} placeholder="Site Email" readOnly={!isEditing} />
          <input name="siteAltEmail" value={formData.siteAltEmail} onChange={handleChange} placeholder="Alternate Email" readOnly={!isEditing} />
          <input name="siteAddress1" value={formData.siteAddress1} onChange={handleChange} placeholder="Address Line 1" readOnly={!isEditing} />
          <input name="siteAddress2" value={formData.siteAddress2} onChange={handleChange} placeholder="Address Line 2" readOnly={!isEditing} />
          <input name="sitePincode" value={formData.sitePincode} onChange={handleChange} placeholder="Pincode" readOnly={!isEditing} />
          <input name="sitePanS3" value={formData.sitePanS3} onChange={handleChange} placeholder="PAN (optional)" readOnly={!isEditing} />
          <input name="siteGstS3" value={formData.siteGstS3} onChange={handleChange} placeholder="GST (optional)" readOnly={!isEditing} />

          {isEditing ? (
            <button type="submit">Save Changes</button>
          ) : (
            <button type="button" onClick={() => setIsEditing(true)}>Edit Sub-site Info</button>
          )}
        </>
      )}
    </form>
  );
};

export default RegisterSubSiteForm;
