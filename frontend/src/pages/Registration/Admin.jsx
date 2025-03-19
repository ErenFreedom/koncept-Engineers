import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Select from "react-select";
import CountryList from "react-select-country-list";
import PhoneInput from "react-phone-input-2";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import "react-phone-input-2/lib/style.css";
import "react-toastify/dist/ReactToastify.css";
import "./Admin.css";

const Admin = () => {
  const navigate = useNavigate(); // ✅ Define navigate function

  const countryOptions = CountryList().getData();
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem("adminFormData");
    return savedData ? JSON.parse(savedData) : {
      first_name: "",
      middle_name: "",
      last_name: "",
      date_of_birth: "",
      nationality: "",
      address1: "",
      address2: "",
      pincode: "",
      phone_number: "",
      landline: "",
      company_name: "",
      company_address1: "",
      company_address2: "",
      company_pincode: "",
      email: "",
      password: "",
      retypePassword: "",
      otp: "",
      aadhar: null,
      pan: null,
      gst: null,
    };
  });

  // ✅ Persist data in LocalStorage
  useEffect(() => {
    localStorage.setItem("adminFormData", JSON.stringify(formData));
  }, [formData]);

  // ✅ Handle File Uploads
  const handleFileUpload = (e, key) => {
    setFormData((prev) => ({
      ...prev,
      [key]: e.target.files[0], // Store only one file per field
    }));
  };

  // ✅ Handle Input Change
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ✅ Submit Form Data
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.retypePassword) {
        toast.error("Passwords do not match!");
        return;
    }

    try {
        const formDataObject = new FormData();
        for (const key in formData) {
            if (formData[key]) {
                formDataObject.append(key, formData[key]);
            }
        }

        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/admin/register`, formDataObject, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success("Admin registered successfully! Redirecting to OTP verification...");
        localStorage.removeItem("adminFormData"); // Clear saved form

        // ✅ Redirect to AdminOtp page after successful form submission
        setTimeout(() => {
            navigate("/AdminOtp"); 
        }, 2000); // Wait for 2 seconds before redirecting

    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to register");
    }
  };

  return (
    <div className="admin-signup-container">
      <div className="form-container">
        <h2 className="form-heading">Admin Registration</h2>

        {/* ✅ First Name */}
        <label className="form-label">
          First Name
          <input type="text" name="first_name" className="form-input" value={formData.first_name} onChange={handleChange} required />
        </label>

        {/* ✅ Middle Name (Optional) */}
        <label className="form-label">
          Middle Name (Optional)
          <input type="text" name="middle_name" className="form-input" value={formData.middle_name} onChange={handleChange} />
        </label>

        {/* ✅ Last Name */}
        <label className="form-label">
          Last Name
          <input type="text" name="last_name" className="form-input" value={formData.last_name} onChange={handleChange} required />
        </label>

        {/* ✅ Date of Birth */}
        <label className="form-label">
          Date of Birth
          <input type="date" name="date_of_birth" className="form-input" value={formData.date_of_birth} onChange={handleChange} required />
        </label>

        {/* ✅ Nationality Dropdown */}
        <label className="form-label">
          Nationality
          <Select options={countryOptions} value={countryOptions.find((option) => option.label === formData.nationality) || null} 
            onChange={(selected) => setFormData({ ...formData, nationality: selected ? selected.label : "" })} 
            placeholder="Select nationality" isClearable className="country-select" />
        </label>

        {/* ✅ Email */}
        <label className="form-label">
          Email
          <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} required />
        </label>

        {/* ✅ Phone Number */}
        <label className="form-label">
          Phone Number
          <PhoneInput country={"in"} value={formData.phone_number} onChange={(value) => setFormData({ ...formData, phone_number: `+${value}` })} 
            inputStyle={{ width: "100%", fontSize: "1rem", borderRadius: "8px" }} />
        </label>

        {/* ✅ Address Fields */}
        <label className="form-label">
          Address 1
          <input type="text" name="address1" className="form-input" value={formData.address1} onChange={handleChange} required />
        </label>
        <label className="form-label">
          Address 2
          <input type="text" name="address2" className="form-input" value={formData.address2} onChange={handleChange} />
        </label>
        <label className="form-label">
          Pincode
          <input type="text" name="pincode" className="form-input" value={formData.pincode} onChange={handleChange} required />
        </label>

        {/* ✅ File Uploads */}
        <label className="form-label">
          Upload Aadhar/PAN/Passport
          <input type="file" className="form-input" onChange={(e) => handleFileUpload(e, "aadhar")} />
        </label>
        <label className="form-label">
          Upload PAN
          <input type="file" className="form-input" onChange={(e) => handleFileUpload(e, "pan")} />
        </label>
        <label className="form-label">
          Upload GST
          <input type="file" className="form-input" onChange={(e) => handleFileUpload(e, "gst")} />
        </label>

        {/* ✅ Password Fields */}
        <label className="form-label">
          Password
          <input type="password" name="password" className="form-input" value={formData.password} onChange={handleChange} required />
        </label>
        <label className="form-label">
          Retype Password
          <input type="password" name="retypePassword" className="form-input" value={formData.retypePassword} onChange={handleChange} required />
        </label>

        {/* ✅ OTP Field */}
        <label className="form-label">
          OTP (Enter the OTP sent to your email/phone)
          <input type="text" name="otp" className="form-input" value={formData.otp} onChange={handleChange} required />
        </label>

        {/* ✅ Submit Button */}
        <button className="next-button" onClick={handleSubmit}>Submit & Register</button>
      </div>
    </div>
  );
};

export default Admin;
