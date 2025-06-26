import React, { useState } from "react";
import "./FormStyles.css";

const AddSubsiteRoomSegmentForm = () => {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [subsiteId, setSubsiteId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Sub-site Room Segment:", { name, roomId, subsiteId });
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>Add Sub-site Room Segment</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Segment Name" />
      <input value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="Room ID" />
      <input value={subsiteId} onChange={(e) => setSubsiteId(e.target.value)} placeholder="Sub-site ID" />
      <button type="submit">Add Segment</button>
    </form>
  );
};

export default AddSubsiteRoomSegmentForm;
