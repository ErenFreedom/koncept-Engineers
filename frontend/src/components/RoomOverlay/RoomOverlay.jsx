import React, { useEffect, useState } from "react";
import { getSensors, assignSensorToRoom } from "../../api/sensor";
import { getRooms } from "../../api/room";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import "./RoomOverlay.css";

const RoomOverlay = ({ room, onClose }) => {
  const { accessToken } = useAuth();
  const [sensors, setSensors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [liveData, setLiveData] = useState([]);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [sensorsFetched, roomsFetched] = await Promise.all([
          getSensors(accessToken),
          getRooms(accessToken),
        ]);
        setSensors(sensorsFetched || []);
        setRooms(roomsFetched || []);
      } catch (err) {
        toast.error("❌ Failed to load sensors or rooms");
      }
    };

    const fetchLiveSensorData = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/dashboard/sensors`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setLiveData(res.data.sensors || []);
      } catch (err) {
        console.error("Live sensor fetch failed:", err.message);
      }
    };

    if (room && accessToken) {
      fetchInitial();
      fetchLiveSensorData();
      const interval = setInterval(fetchLiveSensorData, 5000); // every 5 sec
      return () => clearInterval(interval);
    }
  }, [room, accessToken]);

  const handleAssign = async (sensorId) => {
    try {
      await assignSensorToRoom(sensorId, room.id, accessToken);
      toast.success("✅ Sensor assigned successfully!");
      setSensors((prev) =>
        prev.map((s) => (s.id === sensorId ? { ...s, room_id: room.id } : s))
      );
    } catch (err) {
      toast.error("❌ Failed to assign sensor");
    }
  };

  const getRoomName = (roomId) => {
    const match = rooms.find((r) => r.id === roomId);
    return match ? match.name : "Unknown Room";
  };

  const roomSensors = sensors
    .filter((s) => s.room_id === room.id)
    .map((s) => s.name);

  const activeRoomSensorData = liveData.filter((d) =>
    roomSensors.includes(d.name)
  );

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
              <div className="sensor-info">
                <span className="sensor-name">{sensor.name}</span>
                {sensor.room_id && (
                  <span className="sensor-assigned-room">
                    • Assigned to: {getRoomName(sensor.room_id)}
                  </span>
                )}
              </div>
              <button
                className={`sensor-assign-btn ${sensor.room_id ? "disabled" : ""}`}
                onClick={() => !sensor.room_id && handleAssign(sensor.id)}
                disabled={!!sensor.room_id}
              >
                {sensor.room_id ? "Assigned" : "Add"}
              </button>
            </div>
          ))}
        </div>

        {activeRoomSensorData.length > 0 && (
          <>
            <h3 className="sensor-data-heading">Live Sensor Data</h3>
            <div className="sensor-card-grid">
              {activeRoomSensorData.map((sensor) => (
                <div key={sensor.bank_id} className="sensor-card">
                  <div className="sensor-card-header">
                    <span className="sensor-name-text">{sensor.name}</span>
                    <span className="live-dot" />
                  </div>
                  <div className="sensor-meta">
                    <strong>Value:</strong> {sensor.value}
                  </div>
                  <div className="sensor-meta">
                    <strong>Quality:</strong> {sensor.quality}
                  </div>
                  <div className="sensor-meta">
                    <strong>Timestamp:</strong> {sensor.timestamp}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RoomOverlay;
