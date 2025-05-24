import React, { useEffect, useState } from "react";
import axios from "axios";
import SensorDataView from "./SensorDataView";

const RoomSensorLoader = ({ roomId }) => {
  const [sensors, setSensors] = useState([]);
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const res = await axios.get("http://ec2-98-84-241-148.compute-1.amazonaws.com:3001/api/sensor/list", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const filtered = res.data.sensors.filter(sensor => sensor.room_id === roomId);
        setSensors(filtered);
      } catch (err) {
        console.error("Error fetching sensors", err);
      }
    };

    fetchSensors();
    const interval = setInterval(fetchSensors, 3000);
    return () => clearInterval(interval);
  }, [roomId]);

  return <SensorDataView sensors={sensors} />;
};

export default RoomSensorLoader;