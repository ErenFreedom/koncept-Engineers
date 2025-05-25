import React, { useEffect, useState } from "react";
import { getSensors, assignSensorToRoom } from "../../api/sensor";
import { getRooms } from "../../api/room";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "./RoomOverlay.css";

const RoomOverlay = ({ room, onClose }) => {
  const { accessToken } = useAuth();
  const [sensors, setSensors] = useState([]);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
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

    if (room && accessToken) {
      fetchData();
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

  const getRoomName = (roomId) => {
    const match = rooms.find((r) => r.id === roomId);
    return match ? match.name : "Unknown Room";
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
