import React, { useEffect, useState } from "react";
import "./EditProfile.css";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext"; // ✅ import context

const EditProfile = () => {
  const { id: adminId } = useParams();
  const [profile, setProfile] = useState(null);
  const [showAdmin, setShowAdmin] = useState(true);
  const [showCompany, setShowCompany] = useState(false);
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  const { admin, accessToken, logout } = useAuth(); // ✅ access from context

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!accessToken || !admin?.id) {
          toast.error("Session expired. Please login again.");
          logout();
          return navigate("/Auth");
        }

        if (admin.id.toString() !== adminId.toString()) {
          toast.error("Unauthorized access.");
          return navigate(`/dashboard/${admin.id}`);
        }

        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/admin/profile/${adminId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        setProfile(response.data.profile);
        setForm(response.data.profile);
      } catch (err) {
        console.error("❌ Error loading profile:", err);
        toast.error("Failed to load profile.");
      }
    };

    fetchProfile();
  }, [adminId, admin, accessToken, logout, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    const password = prompt("Enter your password to confirm changes:");
    if (!password) return;

    try {
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/admin/profile/edit/${adminId}`,
        { ...form, password },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      toast.success("✅ Profile updated successfully.");
    } catch (err) {
      console.error("❌ Update failed:", err);
      toast.error(err.response?.data?.message || "Failed to update profile.");
    }
  };

  if (!profile) return <div className="edit-loading">Loading profile...</div>;

  return (
    <div className="edit-profile-container">
      <h1 className="edit-heading">Edit Profile</h1>

      <div className="edit-section">
        <button className="edit-toggle" onClick={() => setShowAdmin((prev) => !prev)}>
          {showAdmin ? "▼" : "►"} Edit Admin Info
        </button>
        {showAdmin && (
          <div className="edit-form">
            <input name="first_name" value={form.first_name} onChange={handleChange} placeholder="First Name" />
            <input name="middle_name" value={form.middle_name || ""} onChange={handleChange} placeholder="Middle Name" />
            <input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Last Name" />
            <input name="date_of_birth" value={form.date_of_birth} onChange={handleChange} placeholder="DOB" />
            <input name="nationality" value={form.nationality || ""} onChange={handleChange} placeholder="Nationality" />
            <input name="phone_number" value={form.phone_number} onChange={handleChange} placeholder="Phone Number" />
            <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
            <input name="alt_email" value={form.alt_email || ""} onChange={handleChange} placeholder="Alternate Email" />
            <input name="landline" value={form.landline || ""} onChange={handleChange} placeholder="Landline" />
            <input name="address1" value={form.address1 || ""} onChange={handleChange} placeholder="Address Line 1" />
            <input name="address2" value={form.address2 || ""} onChange={handleChange} placeholder="Address Line 2" />
            <input name="pincode" value={form.pincode || ""} onChange={handleChange} placeholder="Pincode" />
            <input type="password" value="********" disabled placeholder="Password (not editable)" />
          </div>
        )}
      </div>

      <div className="edit-section">
        <button className="edit-toggle" onClick={() => setShowCompany((prev) => !prev)}>
          {showCompany ? "▼" : "►"} Edit Company Info
        </button>
        {showCompany && (
          <div className="edit-form">
            <input name="company_name" value={form.company_name} onChange={handleChange} placeholder="Company Name" />
            <input name="company_email" value={form.company_email} onChange={handleChange} placeholder="Company Email" />
            <input name="company_address1" value={form.company_address1} onChange={handleChange} placeholder="Company Address 1" />
            <input name="company_address2" value={form.company_address2 || ""} onChange={handleChange} placeholder="Company Address 2" />
            <input name="company_pincode" value={form.company_pincode} onChange={handleChange} placeholder="Company Pincode" />
            <input type="text" value="(File uploads not editable here)" disabled />
          </div>
        )}
      </div>

      <button className="save-button" onClick={handleUpdate}>💾 Save Changes</button>
    </div>
  );
};

export default EditProfile;
