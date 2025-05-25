import React, { useEffect, useState } from "react";
import { getSensors, assignSensorToRoom } from "../../api/sensor";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "./RoomOverlay.css";

const RoomOverlay = ({ room, onClose }) => {
  const { accessToken } = useAuth();
  const [sensors, setSensors] = useState([]);

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const fetched = await getSensors(accessToken);
        setSensors(fetched || []);
      } catch (err) {
        toast.error("❌ Failed to load sensors");
      }
    };

    if (room && accessToken) {
      fetchSensors();
    }
  }, [room, accessToken]);

  const handleAssign = async (sensorId) => {
    try {
      await assignSensorToRoom(sensorId, room.id, accessToken);
      toast.success("✅ Sensor assigned successfully!");
      setSensors((prev) =>
        prev.map((s) =>
          s.id === sensorId ? { ...s, room_id: room.id } : s
        )
      );
    } catch (err) {
      toast.error("❌ Failed to assign sensor");
    }
  };

  if (!room) return null;

  return (
    <div className="room-overlay-container">
      <button className="overlay-close-btn" onClick={onClose}>✕</button>

      <div className="room-overlay-panel">
        <h2>{room.name}</h2>
        <p className="room-overlay-subtext">Assign sensors to this room:</p>

        <div className="sensor-list">
          {sensors.map((sensor) => (
            <div key={sensor.id} className="sensor-row">
              <span className="sensor-name">{sensor.name}</span>
              <button
                className={`sensor-assign-btn ${sensor.room_id ? "disabled" : ""}`}
                onClick={() => !sensor.room_id && handleAssign(sensor.id)}
                disabled={!!sensor.room_id}
                title={sensor.room_id ? "Already assigned" : "Assign to room"}
              >
                {sensor.room_id ? "Assigned" : "Add"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoomOverlay;
