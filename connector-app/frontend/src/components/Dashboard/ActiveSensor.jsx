import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./ActiveSensor.css"; // ✅ Ensure styling for proper layout
import { FaCheckCircle } from "react-icons/fa"; // ✅ Green active icon
import { MdCancel } from "react-icons/md"; // ❌ Red inactive icon

const ActiveSensor = () => {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSensor, setSelectedSensor] = useState(null); // Stores selected sensor info

  useEffect(() => {
    const fetchActiveSensors = async () => {
      try {
        const token = localStorage.getItem("adminToken");

        if (!token) {
          toast.error("Session expired. Please log in again.");
          return;
        }

        const response = await axios.get("http://localhost:5004/api/sensors/active", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("✅ Active Sensors:", response.data);

        if (response.data.sensors && Array.isArray(response.data.sensors)) {
          setSensors(response.data.sensors);
        } else {
          console.error("❌ Unexpected API Response Format:", response.data);
          toast.error("Failed to load active sensors.");
        }
      } catch (error) {
        console.error("❌ Error fetching active sensors:", error.response?.data || error.message);
        toast.error("Failed to load active sensors.");
      } finally {
        setLoading(false);
      }
    };

    fetchActiveSensors();
  }, []);

  /** ✅ Deactivate Sensor */
  const deactivateSensor = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post("http://localhost:5004/api/sensors/deactivate", { sensorId: id }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(`Sensor ${id} deactivated!`);
      setSensors(sensors.map(sensor => sensor.id === id ? { ...sensor, is_active: 0 } : sensor));
    } catch (error) {
      console.error("❌ Error deactivating sensor:", error.response?.data || error.message);
      toast.error("Failed to deactivate sensor.");
    }
  };

  /** ✅ Remove Sensor */
  const removeSensor = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.post(
        "http://localhost:5004/api/sensors/remove",
        { sensorId: id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(`✅ Sensor ${id} removed successfully.`);
      setSensors((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to remove sensor.";

      if (errorMsg.toLowerCase().includes("must be deactivated")) {
        toast.error("⚠️ Please deactivate the sensor before removing it.");
      } else if (errorMsg.toLowerCase().includes("not found")) {
        toast.error("❌ Sensor not found in active sensors.");
      } else {
        toast.error(`❌ ${errorMsg}`);
      }

      console.error("❌ Error removing sensor:", errorMsg);
    }
  };




  const handleSendData = async (sensor) => {
    try {
      const token = localStorage.getItem("adminToken");

      // Step 1: Deactivate the sensor
      await axios.post("http://localhost:5004/api/sensors/deactivate", { sensorId: sensor.bank_id }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Sensor ${sensor.id} deactivated.`);

      // Step 2: Remove the sensor
      await axios.post("http://localhost:5004/api/sensors/remove", { sensorId: sensor.bank_id }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Sensor ${sensor.id} removed.`);

      // Step 3: Update UI
      setSensors(prev => prev.filter(s => s.id !== sensor.id));

      // Optional: proceed to actual "send data" logic here
      toast.info("✅ Sensor cleanup complete. Now sending data...");

    } catch (error) {
      console.error("❌ Error during send data process:", error.response?.data || error.message);
      toast.error("Failed to process sensor cleanup.");
    }
  };


  /** ✅ Show Sensor Info */
  const showInfo = (sensor) => {
    setSelectedSensor(sensor);
  };

  return (
    <div className="active-sensor-bank">
      <h2>Active Sensors</h2>
      <div className="sensor-grid">
        {loading ? (
          <p>Loading active sensors...</p>
        ) : sensors.length > 0 ? (
          sensors.map((sensor) => (
            <div key={sensor.id} className="sensor-card">
              <p><strong>Name:</strong> Sensor {sensor.bank_id}</p>
              <p><strong>ID:</strong> {sensor.id}</p>
              <p><strong>Bank ID:</strong> {sensor.bank_id}</p>

              {/* ✅ Status with Animation */}
              <div className="sensor-status">
                {sensor.is_active ? (
                  <span className="active-status">
                    <FaCheckCircle className="active-icon" /> Activated
                  </span>
                ) : (
                  <span className="inactive-status">
                    <MdCancel className="inactive-icon" /> Inactive
                  </span>
                )}
              </div>

              {/* ✅ Dropdown for actions */}
              <div className="dropdown">
                <button className="dropdown-button">Options ▼</button>
                <div className="dropdown-content">
                  <button onClick={() => handleSendData(sensor)}>Send Data</button>

                  <button onClick={() => deactivateSensor(sensor.bank_id)}>Deactivate</button>


                  <button onClick={() => removeSensor(sensor.bank_id)}>Remove</button>

                  <button onClick={() => showInfo(sensor)}>Show Info</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No active sensors available.</p>
        )}
      </div>

      {/* ✅ Modal for displaying sensor info */}
      {selectedSensor && (
        <div className="modal">
          <div className="modal-content">
            <h3>Sensor Details</h3>
            <p><strong>Name:</strong> Sensor {selectedSensor.bank_id}</p>
            <p><strong>ID:</strong> {selectedSensor.id}</p>
            <p><strong>Bank ID:</strong> {selectedSensor.bank_id}</p>
            <p><strong>Status:</strong> {selectedSensor.is_active ? "Activated" : "Inactive"}</p>
            <button className="close-button" onClick={() => setSelectedSensor(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveSensor;
