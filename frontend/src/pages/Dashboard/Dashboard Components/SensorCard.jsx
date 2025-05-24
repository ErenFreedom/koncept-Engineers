import React from "react";

const SensorCard = ({ sensor }) => {
  return (
    <div className="bg-gray-800 text-white rounded-2xl shadow-md p-4 w-full max-w-sm transition hover:shadow-lg hover:bg-gray-700">
      <h3 className="text-lg font-semibold text-teal-400 mb-2">
        {sensor.name}
      </h3>
      <div className="space-y-1 text-sm">
        <p>
          <span className="font-medium text-gray-300">ID:</span>{" "}
          <span className="text-white">{sensor.id}</span>
        </p>
        <p>
          <span className="font-medium text-gray-300">Object ID:</span>{" "}
          <span className="text-white">{sensor.object_id}</span>
        </p>
        <p>
          <span className="font-medium text-gray-300">Room:</span>{" "}
          <span className="text-white">{sensor.room_id}</span>
        </p>
      </div>
    </div>
  );
};

export default SensorCard;
