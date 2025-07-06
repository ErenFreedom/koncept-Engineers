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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const frLoading = useSelector((state) => state.floorRoomFetch?.loading);
  const poes = useSelector((state) => state.floorRoomFetch?.data?.poes?.piecesOfEquipment || []);
  const poePathData = useSelector((state) => state.sensorMount?.poePath);
  const activeSensors = useSelector((state) => state.sensorMount?.activeSensors || []);

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
    if (!selectedPoeId) return;
    dispatch(fetchActiveSensors(accessToken)); // fetch active sensors list
    setIsModalOpen(true);
  };

  return (
    <div className="data-mount-point-tab">
      <div className="dmp-header">
        <div className="dmp-poe-display">
          <h1 className="dmp-poe-title">
            {poes.find((p) => p.id === Number(selectedPoeId))?.name || "Select a PoE"}
          </h1>
          <p className="dmp-poe-path">
            {frLoading ? "Loading..." : (poePathData?.path || "<path>")}
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
        <div
          className={`dmp-card dmp-add-card ${!selectedPoeId ? "dmp-disabled" : ""}`}
          onClick={handleAddSensor}
          style={{ pointerEvents: selectedPoeId ? "auto" : "none" }}
        >
          <div className="dmp-card-plus">+</div>
        </div>
      </div>

      {isModalOpen && (
        <div className="dmp-modal-backdrop">
          <div className="dmp-modal">
            <button className="dmp-modal-close" onClick={() => setIsModalOpen(false)}>✖</button>
            <h2>Select a Sensor to Assign</h2>
            <table className="dmp-sensor-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Bank ID</th>
                  <th>PoE Assigned</th>
                  <th>Data Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {activeSensors.length === 0 ? (
                  <tr><td colSpan="5" className="no-sensors">No active sensors found.</td></tr>
                ) : (
                  activeSensors.map((sensor) => (
                    <tr key={sensor.bank_id}>
                      <td>{sensor.sensor_name}</td>
                      <td>{sensor.bank_id}</td>
                      <td>{sensor.poe_id ? "Yes" : "No"}</td>
                      <td>{sensor.data_type}</td>
                      <td>{sensor.description}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataMountPoint;
