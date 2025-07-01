import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../../context/AuthContext";
import { addEntity } from "../../../redux/actions/siteActions";
import { fetchHierarchyData } from "../../../redux/actions/hierarchyActions";
import "./FormStyles.css";

const AddRoomSegmentForm = ({ data, setActiveForm }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");

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
    await dispatch(addEntity("room-segment", payload, accessToken));
    dispatch(fetchHierarchyData(null, accessToken));
    setActiveForm(null);
    setName("");
    setRoomId("");
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>{data && data.name ? "Edit Room Segment" : "Add Room Segment"}</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Segment Name" />
      <input value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="Room ID" />
      <button type="submit">{data && data.name ? "Update Segment" : "Add Segment"}</button>
    </form>
  );
};

export default AddRoomSegmentForm;
