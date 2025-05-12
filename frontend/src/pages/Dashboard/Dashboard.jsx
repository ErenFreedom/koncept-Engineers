import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import DashboardHeader from "../../components/DashboardHeader/DashboardHeader";
import "./Dashboard.css";
import { useAuth } from "../../context/AuthContext"; // ✅ import context

const Dashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { admin, accessToken, logout } = useAuth(); // ✅ use context
  const [sensors, setSensors] = useState([]);

  const fetchSensorData = async () => {
    try {
      const res = await axios.get(
        "http://ec2-98-84-241-148.compute-1.amazonaws.com:3001/api/dashboard/sensors",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setSensors(res.data.sensors || []);
    } catch (err) {
      console.error("❌ Failed to fetch sensors:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    // ✅ Redirect if no admin or token in context
    if (!admin || !accessToken) {
      toast.error("Session expired. Please log in again.");
      navigate("/AuthAdmin");
      return;
    }

    // ✅ Validate route param against actual admin ID
    if (admin.id.toString() !== id.toString()) {
      toast.error("Unauthorized access!");
      logout(); // clear context state
      navigate("/AuthAdmin");
      return;
    }

    fetchSensorData();
    const interval = setInterval(fetchSensorData, 3000);
    return () => clearInterval(interval);
  }, [admin, accessToken, id, navigate, logout]);

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
              <p><strong>Value:</strong> {sensor.value ?? "N/A"}</p>
              <p><strong>Quality:</strong> {sensor.quality ?? "N/A"}</p>
              <p><strong>Good?</strong> {sensor.quality_good === 1 ? "Yes" : "No"}</p>
              <p><strong>Timestamp:</strong> {sensor.timestamp ?? "N/A"}</p>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", marginTop: "20px" }}>No active sensors found.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
