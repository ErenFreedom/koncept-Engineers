import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFloorRoomEntity } from "../../../redux/actions/floorRoomFetchActions";
import { getPoePath } from "../../../redux/actions/sensorMountActions";
import { useAuth } from "../../../context/AuthContext";
import "./DataMountPoint.css";

const DataMountPoint = () => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
  const [selectedPoeId, setSelectedPoeId] = useState("");

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

  const handleAddSensor = (index) => {
    console.log(`Open modal for adding sensor to slot ${index + 1}`);
    // TODO: Open your modal here
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
        {[...Array(3)].map((_, index) => (
          <div key={index} className="dmp-card" onClick={() => handleAddSensor(index)}>
            <div className="dmp-card-plus">+</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataMountPoint;
