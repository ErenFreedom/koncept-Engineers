import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../../context/AuthContext";
import { addEntity, editEntity } from "../../../redux/actions/siteActions";
import { fetchHierarchyData } from "../../../redux/actions/hierarchyActions";
import "./FormStyles.css";

const AddRoomSegmentForm = ({ data, setActiveForm }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const isEditing = data?.isEditing || false;

  useEffect(() => {
    if (data && data.name) {
      setName(data.name || "");
      setRoomId(data.room_id || "");
    } else if (data && data.parentType === "room" && data.parentId) {
      setName("");
      setRoomId(data.parentId);
    } else {
      setName("");
      setRoomId("");
    }
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name, room_id: roomId };
    if (isEditing) {
      await dispatch(editEntity("room-segment", { ...payload, id: data.id }, accessToken));
    } else {
      await dispatch(addEntity("room-segment", payload, accessToken));
    }
    dispatch(fetchHierarchyData(null, accessToken));
    setActiveForm(null);
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>{isEditing ? "Edit Room Segment" : "Add Room Segment"}</h3>
      <input
        value={name}
        onChange={(e) => isEditing && setName(e.target.value)}
        placeholder="Segment Name"
        readOnly={!isEditing && !!data?.name}
      />
      <label>Room ID</label>
      <input value={roomId} readOnly placeholder="Room ID" />
      <button type="submit">{isEditing ? "Update Segment" : "Add Segment"}</button>
    </form>
  );
};

export default AddRoomSegmentForm;
