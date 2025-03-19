import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import DashboardHeader from "../../components/DashboardHeader/DashboardHeader"; 
import HomeFooter from "../../components/HomePage/HomeFooter";
import axios from "axios";
import "./Dashboard.css";

const Dashboard = () => {
  const { id } = useParams(); // Extract admin ID from URL
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    // ✅ Get JWT Token from Local Storage
    const token = localStorage.getItem("adminToken");

    if (!token) {
      toast.error("Session expired. Please log in again.");
      navigate("/AuthAdmin"); // Redirect if not logged in
      return;
    }

    // ✅ Decode JWT Token
    const decoded = jwtDecode(token);
    
    if (decoded.adminId !== id) {
      toast.error("Unauthorized access!");
      navigate("/AuthAdmin"); // Redirect if ID doesn't match
      return;
    }

    // ✅ Fetch Admin Details from API
    const fetchAdminDetails = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/admin/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAdmin(data);
      } catch (error) {
        toast.error("Failed to load admin details.");
      }
    };

    fetchAdminDetails();
  }, [id, navigate]);

  if (!admin) return <p>Loading Dashboard...</p>;

  return (
    <div className="dashboard-container">
      <DashboardHeader /> {/* Header */}
      <div className="dashboard-content">
        <h1>Welcome, {admin.firstName} {admin.lastName}!</h1>
        <p><strong>Email:</strong> {admin.email}</p>
        <p><strong>Phone:</strong> {admin.phoneNumber}</p>
        <p><strong>Company:</strong> {admin.companyId}</p>
        <p><strong>Nationality:</strong> {admin.nationality}</p>
      </div>
      <HomeFooter /> {/* Footer */}
    </div>
  );
};

export default Dashboard;
