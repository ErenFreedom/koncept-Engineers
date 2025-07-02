import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../../context/AuthContext";
import { addEntity, editEntity } from "../../../redux/actions/siteActions";
import { fetchHierarchyData } from "../../../redux/actions/hierarchyActions";
import "./FormStyles.css";

const AddRoomForm = ({ data, setActiveForm }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
  const [name, setName] = useState("");
  const [floorId, setFloorId] = useState("");

  const isEditing = !!data?.isEditing; // ✅ reactive

  useEffect(() => {
    if (data && data.name) {
      setName(data.name || "");
      setFloorId(data.floor_id || "");
    } else if (data && data.parentType === "floor" && data.parentId) {
      setName("");
      setFloorId(data.parentId);
    } else {
      setName("");
      setFloorId("");
    }
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name, floor_id: floorId };
    if (isEditing) {
      await dispatch(editEntity("room", { ...payload, id: data.id }, accessToken));
    } else {
      await dispatch(addEntity("room", payload, accessToken));
    }
    dispatch(fetchHierarchyData(null, accessToken));
    setActiveForm(null);
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>{isEditing ? "Edit Room" : "Add Room"}</h3>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Room Name"
        readOnly={!isEditing && !!data?.name}
      />
      <label>Floor ID</label>
      <input value={floorId} readOnly placeholder="Floor ID" />
      <button type="submit">{isEditing ? "Update Room" : "Add Room"}</button>
    </form>
  );
};

export default AddRoomForm;
