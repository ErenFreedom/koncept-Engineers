import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./SensorBank.css"; // Ensure proper styling

const SensorBank = () => {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSensor, setSelectedSensor] = useState(null); // Stores selected sensor info

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const token = localStorage.getItem("adminToken");

        if (!token) {
          toast.error("Session expired. Please log in again.");
          return;
        }

        const response = await axios.get("http://localhost:5004/api/sensor/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("✅ Raw API Response:", response.data);

        let extractedSensors = [];
        if (response.data.sensors) {
          if (Array.isArray(response.data.sensors)) {
            extractedSensors = response.data.sensors;
          } else if (Array.isArray(response.data.sensors.sensors)) {
            extractedSensors = response.data.sensors.sensors;
          }
        }

        if (extractedSensors.length > 0) {
          setSensors(extractedSensors);
        } else {
          console.error("❌ Unexpected API Response Format:", response.data);
          toast.error("Failed to load sensors.");
        }
      } catch (error) {
        console.error("❌ Error fetching sensors:", error.response?.data || error.message);
        toast.error("Failed to load sensors.");
      } finally {
        setLoading(false);
      }
    };

    fetchSensors();
  }, []);

  /** ✅ Activate Sensor */
  const activateSensor = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post("http://localhost:5004/api/sensors/activate", { sensorId: id }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(`Sensor ${id} activated!`);
    } catch (error) {
      console.error("❌ Error activating sensor:", error.response?.data || error.message);
      toast.error("Failed to activate sensor.");
    }
  };

  /** ✅ Delete Sensor */
  const deleteSensor = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`http://localhost:5004/api/sensor/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(`Sensor ${id} deleted!`);
      setSensors(sensors.filter(sensor => sensor.id !== id));
    } catch (error) {
      console.error("❌ Error deleting sensor:", error.response?.data || error.message);
      toast.error("Failed to delete sensor.");
    }
  };

  /** ✅ Show Sensor Info */
  const showInfo = (sensor) => {
    setSelectedSensor(sensor);
  };

  return (
    <div className="sensor-bank">
      <h2>Sensor Bank</h2>
      <div className="sensor-grid">
        {loading ? (
          <p>Loading sensors...</p>
        ) : sensors.length > 0 ? (
          sensors.map((sensor) => (
            <div key={sensor.id} className="sensor-card">
              <p><strong>Name:</strong> {sensor.name}</p>
              <p><strong>ID:</strong> {sensor.id}</p>

              {/* ✅ Dropdown for actions */}
              <div className="dropdown">
                <button className="dropdown-button">Options ▼</button>
                <div className="dropdown-content">
                  <button onClick={() => activateSensor(sensor.id)}>Activate</button>
                  <button onClick={() => deleteSensor(sensor.id)}>Delete</button>
                  <button onClick={() => showInfo(sensor)}>Show Info</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No sensors available.</p>
        )}

        {/* Plus sign button for adding new sensor */}
        <div className="sensor-card add-sensor">
          <button className="add-button">+</button>
        </div>
      </div>

      {/* ✅ Modal for displaying sensor info */}
      {selectedSensor && (
        <div className="modal">
          <div className="modal-content">
            <h3>Sensor Details</h3>
            <p><strong>Name:</strong> {selectedSensor.name}</p>
            <p><strong>ID:</strong> {selectedSensor.id}</p>
            <p><strong>Description:</strong> {selectedSensor.description}</p>
            <p><strong>Object ID:</strong> {selectedSensor.object_id}</p>
            <p><strong>Property Name:</strong> {selectedSensor.property_name}</p>
            <p><strong>Data Type:</strong> {selectedSensor.data_type}</p>
            <button className="close-button" onClick={() => setSelectedSensor(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SensorBank;
