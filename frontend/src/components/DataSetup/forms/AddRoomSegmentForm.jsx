import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../../context/AuthContext";
import { addEntity } from "../../../redux/actions/siteActions";
import { fetchHierarchyData } from "../../../redux/actions/hierarchyActions";
import "./FormStyles.css";

const AddRoomSegmentForm = ({ data, setDropdownAction }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    if (data) {
      setName(data.name || "");
      setRoomId(data.room_id || "");
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
    setDropdownAction(null); // ✅ reset
    setName("");
    setRoomId("");
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>{data ? "Edit Room Segment" : "Add Room Segment"}</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Segment Name" />
      <input value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="Room ID" />
      <button type="submit">{data ? "Update Segment" : "Add Segment"}</button>
    </form>
  );
};

export default AddRoomSegmentForm;
