import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFloorRoomEntity } from "../../../redux/actions/floorRoomFetchActions";
import { getPoePath, fetchActiveSensors } from "../../../redux/actions/sensorMountActions";
import { fetchMainSiteSensorData } from "../../../redux/actions/displaySensorDataActions";
import { useAuth } from "../../../context/AuthContext";
import "./DataMountPoint.css";

const DataMountPoint = () => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
  const [selectedPoeId, setSelectedPoeId] = useState("");
  const [assignedSensors, setAssignedSensors] = useState([]); // sensors assigned to this PoE

  const frLoading = useSelector((state) => state.floorRoomFetch?.loading);
  const poes = useSelector((state) => state.floorRoomFetch?.data?.poes?.piecesOfEquipment || []);
  const poePath = useSelector((state) => state.sensorMount?.poePath);

  useEffect(() => {
    if (accessToken) {
      dispatch(fetchFloorRoomEntity("/api/poes", "poes", accessToken));
    }
  }, [dispatch, accessToken]);

  useEffect(() => {
    if (selectedPoeId) {
      dispatch(getPoePath(selectedPoeId, accessToken));
    }
  }, [selectedPoeId, dispatch, accessToken]);

  const handleAddSensor = () => {
    console.log("Opening sensor selection modal...");
    // Fetch active sensors list:
    dispatch(fetchMainSiteSensorData(accessToken));
    // Here you can show a modal and populate it with the fetched sensors
  };

  return (
    <div className="data-mount-point-tab">
      <div className="dmp-header">
        <div className="dmp-poe-display">
          <h1 className="dmp-poe-title">
            {poes.find((p) => p.id === Number(selectedPoeId))?.name || "Select a PoE"}
          </h1>
          <p className="dmp-poe-path">
            {frLoading ? "Loading..." : (poePath?.path || "<path>")}
          </p>
        </div>

        <div className="dmp-controls">
          <select
            value={selectedPoeId}
            onChange={(e) => setSelectedPoeId(e.target.value)}
          >
            <option value="">Select PoE</option>
            {poes.map((poe) => (
              <option key={poe.id} value={poe.id}>
                {poe.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="dmp-card-grid">
        {assignedSensors.map((sensor, index) => (
          <div key={index} className="dmp-sensor-card">
            <h3>{sensor.name}</h3>
            <p>ID: {sensor.bank_id}</p>
            <p>Active: {sensor.is_active ? "Yes" : "No"}</p>
          </div>
        ))}

        <div className="dmp-card dmp-add-card" onClick={handleAddSensor}>
          <div className="dmp-card-plus">+</div>
        </div>
      </div>
    </div>
  );
};

export default DataMountPoint;
