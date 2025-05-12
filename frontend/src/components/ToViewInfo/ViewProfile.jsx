import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ViewProfile.css";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext"; // ✅ context import
import { useNavigate } from "react-router-dom";

const ViewProfile = () => {
  const [profile, setProfile] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showCompany, setShowCompany] = useState(false);

  const { admin, accessToken, logout } = useAuth(); // ✅ context hook
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!admin?.id || !accessToken) {
          toast.error("Session expired. Please login again.");
          logout();
          return navigate("/Auth");
        }

        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/admin/profile/${admin.id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        setProfile(response.data.profile);
      } catch (error) {
        console.error("❌ Error fetching profile:", error);
        toast.error("Failed to fetch profile.");
      }
    };

    fetchProfile();
  }, [admin, accessToken, logout, navigate]);

  if (!profile) return <div className="profile-loading">Loading profile...</div>;

  return (
    <div className="profile-page">
      <h1 className="profile-heading-main">Profile Information</h1>

      <div className="dropdown-container">
        <div className="dropdown-section">
          <button className="dropdown-toggle" onClick={() => setShowAdmin(prev => !prev)}>
            Admin Info {showAdmin ? "▲" : "▼"}
          </button>
          {showAdmin && (
            <div className="dropdown-content">
              <p><strong>Name:</strong> {profile.first_name} {profile.middle_name || ""} {profile.last_name}</p>
              <p><strong>Date of Birth:</strong> {profile.date_of_birth}</p>
              <p><strong>Phone:</strong> {profile.phone_number}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Nationality:</strong> {profile.nationality}</p>
              <p><strong>Address:</strong> {profile.address1}, {profile.address2}</p>
              <p><strong>Pincode:</strong> {profile.pincode}</p>
              <p><strong>Landline:</strong> {profile.landline || "N/A"}</p>
            </div>
          )}
        </div>

        <div className="dropdown-section">
          <button className="dropdown-toggle" onClick={() => setShowCompany(prev => !prev)}>
            Company Info {showCompany ? "▲" : "▼"}
          </button>
          {showCompany && (
            <div className="dropdown-content">
              <p><strong>Name:</strong> {profile.company_name}</p>
              <p><strong>Email:</strong> {profile.company_email}</p>
              <p><strong>Address:</strong> {profile.company_address1}, {profile.company_address2}</p>
              <p><strong>Pincode:</strong> {profile.company_pincode}</p>
              <p><strong>PAN Doc:</strong> {
                profile.pan_s3 ? <a href={`/${profile.pan_s3}`} target="_blank" rel="noopener noreferrer">View</a> : "Not Uploaded"
              }</p>
              <p><strong>GST Doc:</strong> {
                profile.gst_s3 ? <a href={`/${profile.gst_s3}`} target="_blank" rel="noopener noreferrer">View</a> : "Not Uploaded"
              }</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
