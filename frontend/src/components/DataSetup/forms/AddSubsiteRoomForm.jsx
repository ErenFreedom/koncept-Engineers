import React, { useState } from "react";
import "./FormStyles.css";

const AddSubsiteRoomForm = () => {
  const [name, setName] = useState("");
  const [floorId, setFloorId] = useState("");
  const [subsiteId, setSubsiteId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Sub-site Room:", { name, floorId, subsiteId });
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>Add Sub-site Room</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Room Name" />
      <input value={floorId} onChange={(e) => setFloorId(e.target.value)} placeholder="Floor ID" />
      <input value={subsiteId} onChange={(e) => setSubsiteId(e.target.value)} placeholder="Sub-site ID" />
      <button type="submit">Add Room</button>
    </form>
  );
};

export default AddSubsiteRoomForm;
