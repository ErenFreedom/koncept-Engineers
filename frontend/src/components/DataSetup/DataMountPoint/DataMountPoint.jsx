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
  const [poeOptions, setPoeOptions] = useState([]);

  const { floorRoomData, frLoading } = useSelector((state) => state.floorRoomFetch || {});
  const poePath = useSelector((state) => state.sensorMount?.poePath);

  useEffect(() => {
    if (accessToken) {
      dispatch(fetchFloorRoomEntity("/poes", "poes", accessToken));
    }
  }, [dispatch, accessToken]);

  useEffect(() => {
    if (floorRoomData?.poes?.piecesOfEquipment?.length) {
      setPoeOptions(floorRoomData.poes.piecesOfEquipment);
    }
  }, [floorRoomData]);

  useEffect(() => {
    if (selectedPoeId) {
      dispatch(getPoePath(selectedPoeId, accessToken));
    }
  }, [selectedPoeId, dispatch, accessToken]);

  return (
    <div className="data-mount-point-tab">
      <div className="dmp-header">
        <div className="dmp-poe-name">
          <h3>POE NAME</h3>
          <p>{poeOptions.find((p) => p.id === Number(selectedPoeId))?.name || "Select a PoE"}</p>
        </div>
        <div className="dmp-controls">
          <select
            value={selectedPoeId}
            onChange={(e) => setSelectedPoeId(e.target.value)}
          >
            <option value="">Select PoE</option>
            {poeOptions.map((poe) => (
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

      <div className="dmp-path-section">
        <h4>Hierarchy Path</h4>
        {frLoading ? (
          <p>Loading...</p>
        ) : (
          <p className="dmp-path">
            {poePath?.path || "Select a PoE to display its path"}
          </p>
        )}
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
