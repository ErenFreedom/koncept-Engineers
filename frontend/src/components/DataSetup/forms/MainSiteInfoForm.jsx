import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../../context/AuthContext";
import { editMainSiteInfo } from "../../../redux/actions/subsiteActions"; // ✅ make sure you have this action
import "./FormStyles.css";

const MainSiteInfoForm = ({ data }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();

  const [formData, setFormData] = useState({
    company_name: "",
    company_email: "",
    company_alt_email: "",
    company_address1: "",
    company_address2: "",
    company_pincode: "",
    pan_s3: "",
    gst_s3: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (data) {
      setFormData({
        company_name: data.company_name || "",
        company_email: data.company_email || "",
        company_alt_email: data.company_alt_email || "",
        company_address1: data.company_address1 || "",
        company_address2: data.company_address2 || "",
        company_pincode: data.company_pincode || "",
        pan_s3: data.pan_s3 || "",
        gst_s3: data.gst_s3 || "",
      });
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company_name.trim()) {
      alert("Company name is required");
      return;
    }
    await dispatch(editMainSiteInfo(formData, accessToken));
    setIsEditing(false);
  };


  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>Company Info</h3>
      <input
        name="company_name"
        value={formData.company_name}
        onChange={handleChange}
        placeholder="Company Name"
        readOnly={!isEditing}
      />
      <input
        name="company_email"
        value={formData.company_email}
        onChange={handleChange}
        placeholder="Company Email"
        readOnly={!isEditing}
      />
      <input
        name="company_alt_email"
        value={formData.company_alt_email}
        onChange={handleChange}
        placeholder="Alternate Email"
        readOnly={!isEditing}
      />
      <input
        name="company_address1"
        value={formData.company_address1}
        onChange={handleChange}
        placeholder="Address Line 1"
        readOnly={!isEditing}
      />
      <input
        name="company_address2"
        value={formData.company_address2}
        onChange={handleChange}
        placeholder="Address Line 2"
        readOnly={!isEditing}
      />
      <input
        name="company_pincode"
        value={formData.company_pincode}
        onChange={handleChange}
        placeholder="Pincode"
        readOnly={!isEditing}
      />

      <h3>Documents</h3>
      <input
        name="pan_s3"
        value={formData.pan_s3}
        onChange={handleChange}
        placeholder="PAN URL"
        readOnly={!isEditing}
      />
      <input
        name="gst_s3"
        value={formData.gst_s3}
        onChange={handleChange}
        placeholder="GST URL"
        readOnly={!isEditing}
      />

      {isEditing ? (
        <button type="submit">Save Changes</button>
      ) : (
        <button type="button" onClick={() => setIsEditing(true)}>Edit Info</button>
      )}
    </form>
  );
};

export default MainSiteInfoForm;
