import React, { useState, useEffect } from "react";
import "./FormStyles.css";

const MainSiteInfoForm = ({ data }) => {
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

  // Update form when new data prop arrives
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated Main Site Info:", formData);
    // Here you'd dispatch editMainSiteInfo(formData, token) redux action.
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>Company Info</h3>
      <input
        name="company_name"
        value={formData.company_name}
        onChange={handleChange}
        placeholder="Company Name"
      />
      <input
        name="company_email"
        value={formData.company_email}
        onChange={handleChange}
        placeholder="Company Email"
      />
      <input
        name="company_alt_email"
        value={formData.company_alt_email}
        onChange={handleChange}
        placeholder="Alternate Email"
      />
      <input
        name="company_address1"
        value={formData.company_address1}
        onChange={handleChange}
        placeholder="Address Line 1"
      />
      <input
        name="company_address2"
        value={formData.company_address2}
        onChange={handleChange}
        placeholder="Address Line 2"
      />
      <input
        name="company_pincode"
        value={formData.company_pincode}
        onChange={handleChange}
        placeholder="Pincode"
      />

      <h3>Documents</h3>
      <input
        name="pan_s3"
        value={formData.pan_s3}
        onChange={handleChange}
        placeholder="PAN URL"
      />
      <input
        name="gst_s3"
        value={formData.gst_s3}
        onChange={handleChange}
        placeholder="GST URL"
      />

      <button type="submit">Save Changes</button>
    </form>
  );
};

export default MainSiteInfoForm;
