import React from "react";
import SensorCard from "./SensorCard";

const SensorDataView = ({ sensors }) => {
  if (sensors.length === 0) {
    return <p>No sensors found in this room.</p>;
  }

  return (
    <div className="sensor-grid-container">
      {sensors.map((sensor) => (
        <SensorCard key={sensor.id} sensor={sensor} />
      ))}
    </div>
  );
};

export default SensorDataView;