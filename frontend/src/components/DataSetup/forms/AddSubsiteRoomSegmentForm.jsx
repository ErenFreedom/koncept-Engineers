import React, { useState, useEffect } from "react";
import "./FormStyles.css";

const AddSubsiteRoomSegmentForm = ({ data, onSubmit }) => {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [subsiteId, setSubsiteId] = useState("");

  useEffect(() => {
    if (data) {
      setName(data.name || "");
      setRoomId(data.room_id || "");
      setSubsiteId(data.subsite_id || "");
    } else {
      setName("");
      setRoomId("");
      setSubsiteId("");
    }
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, roomId, subsiteId });
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>{data ? "Edit Sub-site Room Segment" : "Add Sub-site Room Segment"}</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Segment Name" />
      <input value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="Room ID" />
      <input value={subsiteId} onChange={(e) => setSubsiteId(e.target.value)} placeholder="Sub-site ID" />
      <button type="submit">{data ? "Update Segment" : "Add Segment"}</button>
    </form>
  );
};

export default AddSubsiteRoomSegmentForm;
