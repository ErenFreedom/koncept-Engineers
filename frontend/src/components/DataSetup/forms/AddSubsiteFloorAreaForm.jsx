import React, { useState } from "react";
import "./FormStyles.css";

const AddSubsiteFloorAreaForm = () => {
  const [name, setName] = useState("");
  const [floorId, setFloorId] = useState("");
  const [subsiteId, setSubsiteId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Sub-site Floor Area:", { name, floorId, subsiteId });
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>Add Sub-site Floor Area</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Area Name" />
      <input value={floorId} onChange={(e) => setFloorId(e.target.value)} placeholder="Floor ID" />
      <input value={subsiteId} onChange={(e) => setSubsiteId(e.target.value)} placeholder="Sub-site ID" />
      <button type="submit">Add Floor Area</button>
    </form>
  );
};

export default AddSubsiteFloorAreaForm;
