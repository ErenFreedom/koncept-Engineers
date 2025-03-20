import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import DashboardHeader from "../../components/DashboardHeader/DashboardHeader";
import HomeFooter from "../../components/HomePage/HomeFooter";
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

    try {
      // ✅ Decode JWT Token
      const decoded = jwtDecode(token);

      console.log("🔍 Decoded Token Data:", decoded);
      console.log("🔍 URL Admin ID:", id);

      // ✅ Ensure adminId matches the URL parameter
      if (decoded.adminId.toString() !== id.toString()) {
        console.error("❌ Unauthorized access! Token ID does not match URL ID.");
        toast.error("Unauthorized access!");
        localStorage.removeItem("adminToken"); // Force logout
        navigate("/AuthAdmin");
        return;
      }

      // ✅ Set Admin Details from JWT (TEMP FIX)
      setAdmin({
        id: decoded.adminId,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        email: decoded.email,
        phoneNumber: decoded.phoneNumber,
        companyId: decoded.companyId,
        nationality: decoded.nationality
      });

    } catch (error) {
      console.error("❌ Error decoding token:", error);
      toast.error("Invalid session. Please log in again.");
      localStorage.removeItem("adminToken"); // Force logout
      navigate("/AuthAdmin");
    }
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
