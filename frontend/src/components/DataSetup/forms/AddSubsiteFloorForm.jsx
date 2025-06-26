import React, { useState } from "react";
import "./FormStyles.css";

const AddSubsiteFloorForm = () => {
  const [name, setName] = useState("");
  const [floorLevel, setFloorLevel] = useState("");
  const [subsiteId, setSubsiteId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Sub-site Floor:", { name, floorLevel, subsiteId });
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>Add Sub-site Floor</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Floor Name" />
      <input value={floorLevel} onChange={(e) => setFloorLevel(e.target.value)} placeholder="Floor Level" />
      <input value={subsiteId} onChange={(e) => setSubsiteId(e.target.value)} placeholder="Sub-site ID" />
      <button type="submit">Add Floor</button>
    </form>
  );
};

export default AddSubsiteFloorForm;
