import React, { useState, useEffect } from "react";
import "./FormStyles.css";

const RegisterSubSiteForm = ({ data, onRegister, onEdit, onDelete }) => {
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

  useEffect(() => {
    if (data) {
      setFormData({
        adminEmail: data.subSiteEmail || "",
        adminPhone: "",               // usually not returned; kept empty
        otpMethod: "email",           // not needed when editing
        otp: "",                      // not needed when editing
        siteName: data.subSiteName || "",
        siteEmail: data.subSiteEmail || "",
        siteAltEmail: data.subSiteAltEmail || "",
        siteAddress1: data.address1 || "",
        siteAddress2: data.address2 || "",
        sitePincode: data.pincode || "",
        sitePanS3: data.pan_s3 || "",
        siteGstS3: data.gst_s3 || "",
      });
    } else {
      setFormData({
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
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    console.log("Register Sub-site:", formData);
    if (onRegister) onRegister(formData);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    console.log("Edit Sub-site:", formData);
    if (onEdit) onEdit(data?.subSiteId, formData);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to delete this sub-site?")) {
      console.log("Delete Sub-site:", data?.subSiteId);
      if (onDelete) onDelete(data?.subSiteId);
    }
  };

  return (
    <form className="form-container" onSubmit={data ? handleEdit : handleRegister}>
      <h3>{data ? "Edit Sub-Site" : "Register Sub-Site"}</h3>

      {!data && (
        <>
          <input name="adminEmail" value={formData.adminEmail} onChange={handleChange} placeholder="Admin Email" />
          <input name="adminPhone" value={formData.adminPhone} onChange={handleChange} placeholder="Admin Phone" />

          <select name="otpMethod" value={formData.otpMethod} onChange={handleChange}>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
          </select>

          <input name="otp" value={formData.otp} onChange={handleChange} placeholder="OTP" />
        </>
      )}

      <input name="siteName" value={formData.siteName} onChange={handleChange} placeholder="Site Name" />
      <input name="siteEmail" value={formData.siteEmail} onChange={handleChange} placeholder="Site Email" />
      <input name="siteAltEmail" value={formData.siteAltEmail} onChange={handleChange} placeholder="Alt Email" />
      <input name="siteAddress1" value={formData.siteAddress1} onChange={handleChange} placeholder="Address Line 1" />
      <input name="siteAddress2" value={formData.siteAddress2} onChange={handleChange} placeholder="Address Line 2" />
      <input name="sitePincode" value={formData.sitePincode} onChange={handleChange} placeholder="Pincode" />
      <input name="sitePanS3" value={formData.sitePanS3} onChange={handleChange} placeholder="PAN (optional)" />
      <input name="siteGstS3" value={formData.siteGstS3} onChange={handleChange} placeholder="GST (optional)" />

      <div style={{ display: "flex", gap: "10px" }}>
        <button type="submit">{data ? "Update Sub-Site" : "Register Sub-Site"}</button>
        {data && (
          <button type="button" onClick={handleDelete} style={{ background: "red", color: "white" }}>
            Delete Sub-Site
          </button>
        )}
      </div>
    </form>
  );
};

export default RegisterSubSiteForm;
