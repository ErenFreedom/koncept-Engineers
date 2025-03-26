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

  const fetchSensorData = async (token) => {
    try {
      const res = await axios.get("http://ec2-98-84-241-148.compute-1.amazonaws.com:3001/api/dashboard/sensors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSensors(res.data.sensors || []);
    } catch (err) {
      console.error("❌ Failed to fetch sensors:", err.response?.data || err.message);
    }
  };

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
      });

      fetchSensorData(token); // Load once
      const interval = setInterval(() => fetchSensorData(token), 3000); // Refresh every 3s
      return () => clearInterval(interval);
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

      <div className="dashboard-heading">
        <h1>Welcome, {admin.firstName} {admin.lastName}!</h1>
      </div>

      <div className="sensor-grid-container">
        {sensors.length > 0 ? (
          sensors.map((sensor, index) => (
            <div className="sensor-card" key={index}>
              <div className="sensor-header">
                <h3>{sensor.name}</h3>
                <span className="green-dot" title="Active"></span>
              </div>
              <p><strong>Bank ID:</strong> {sensor.bank_id}</p>
              <p><strong>Value:</strong> {sensor.latest_data?.value ?? "N/A"}</p>
              <p><strong>Quality:</strong> {sensor.latest_data?.quality ?? "N/A"}</p>
              <p><strong>Good?</strong> {sensor.latest_data?.quality_good ? "Yes" : "No"}</p>
              <p><strong>Timestamp:</strong> {sensor.latest_data?.timestamp ?? "N/A"}</p>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", marginTop: "20px" }}>No active sensors found.</p>
        )}
      </div>

      <HomeFooter />
    </div>
  );
};

export default Dashboard;
