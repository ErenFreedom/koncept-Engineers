import React, { useState } from "react";
import "./FormStyles.css";

const AddRoomSegmentForm = () => {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Room Segment:", { name, roomId });
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>Add Room Segment</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Segment Name" />
      <input value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="Room ID" />
      <button type="submit">Add Segment</button>
    </form>
  );
};

export default AddRoomSegmentForm;
