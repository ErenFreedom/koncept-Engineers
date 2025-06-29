import React, { useState, useEffect } from "react";
import "./FormStyles.css";

const AddRoomSegmentForm = ({ data, onSubmit }) => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, room_id: roomId });
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
