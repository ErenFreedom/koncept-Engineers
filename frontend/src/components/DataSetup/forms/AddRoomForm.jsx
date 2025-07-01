import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../../context/AuthContext";
import { addEntity } from "../../../redux/actions/siteActions";
import { fetchHierarchyData } from "../../../redux/actions/hierarchyActions";
import "./FormStyles.css";

const AddRoomForm = ({ data, setDropdownAction }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
  const [name, setName] = useState("");
  const [floorId, setFloorId] = useState("");

  useEffect(() => {
    if (data) {
      setName(data.name || "");
      setFloorId(data.floor_id || "");
    } else {
      setName("");
      setFloorId("");
    }
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name, floor_id: floorId };
    await dispatch(addEntity("room", payload, accessToken));
    dispatch(fetchHierarchyData(null, accessToken));
    setDropdownAction(null); // ✅ reset
    setName("");
    setFloorId("");
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>{data ? "Edit Room" : "Add Room"}</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Room Name" />
      <input value={floorId} onChange={(e) => setFloorId(e.target.value)} placeholder="Floor ID" />
      <button type="submit">{data ? "Update Room" : "Add Room"}</button>
    </form>
  );
};

export default AddRoomForm;
