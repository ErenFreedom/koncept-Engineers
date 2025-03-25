import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import axios from "axios";
import DashboardHeader from "../../components/DashboardHeader/DashboardHeader";
import HomeFooter from "../../components/HomePage/HomeFooter";
import "./Dashboard.css";

const Dashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [sensors, setSensors] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      toast.error("Session expired. Please log in again.");
      navigate("/AuthAdmin");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.adminId.toString() !== id.toString()) {
        toast.error("Unauthorized access!");
        localStorage.removeItem("adminToken");
        navigate("/AuthAdmin");
        return;
      }

      setAdmin({
        id: decoded.adminId,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        email: decoded.email,
        phoneNumber: decoded.phoneNumber,
        companyId: decoded.companyId,
        nationality: decoded.nationality,
      });

      // ✅ Fetch Sensors from Backend
      axios
        .get("http://ec2-98-84-241-148.compute-1.amazonaws.com:3001/api/dashboard/sensors", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setSensors(response.data.sensors || []);
        })
        .catch((error) => {
          console.error("❌ Failed to fetch sensors:", error.response?.data || error.message);
          toast.error("Failed to fetch sensor data.");
        });

    } catch (error) {
      toast.error("Invalid session. Please log in again.");
      localStorage.removeItem("adminToken");
      navigate("/AuthAdmin");
    }
  }, [id, navigate]);

  if (!admin) return <p>Loading Dashboard...</p>;

  return (
    <div className="dashboard-container">
      <DashboardHeader />
      <div className="dashboard-content">
        <h1>Welcome, {admin.firstName} {admin.lastName}!</h1>
        <p><strong>Email:</strong> {admin.email}</p>
        <p><strong>Phone:</strong> {admin.phoneNumber}</p>
        <p><strong>Company:</strong> {admin.companyId}</p>
        <p><strong>Nationality:</strong> {admin.nationality}</p>
      </div>

      {/* ✅ Sensor Cards Section */}
      <div className="sensor-grid-container">
        {sensors.length > 0 ? (
          sensors.map((sensor, index) => (
            <div className="sensor-card" key={index}>
              <h3>{sensor.name}</h3>
              <p><strong>Bank ID:</strong> {sensor.bank_id}</p>
              <p><strong>Value:</strong> {sensor.value}</p>
              <p><strong>Quality:</strong> {sensor.quality}</p>
              <p><strong>Good?</strong> {sensor.quality_good ? "Yes" : "No"}</p>
              <p><strong>Timestamp:</strong> {sensor.timestamp}</p>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", marginTop: "20px" }}>No sensors found.</p>
        )}
      </div>

      <HomeFooter />
    </div>
  );
};

export default Dashboard;
