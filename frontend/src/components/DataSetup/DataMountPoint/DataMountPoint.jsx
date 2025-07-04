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

          <button
            disabled={!selectedPoeId}
            onClick={() => dispatch(getPoePath(selectedPoeId, accessToken))}
          >
            Active Sensors
          </button>
        </div>
      </div>

      <div className="dmp-card-grid">
        <div className="dmp-card">CARD (3 in 1 row)</div>
        <div className="dmp-card">CARD</div>
        <div className="dmp-card">CARD</div>
      </div>
    </div>
  );
};

export default DataMountPoint;
