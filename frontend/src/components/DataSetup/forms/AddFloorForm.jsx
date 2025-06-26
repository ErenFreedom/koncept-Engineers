import React, { useState } from "react";
import "./FormStyles.css";

const AddFloorAreaForm = () => {
  const [name, setName] = useState("");
  const [floorId, setFloorId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Floor Area:", { name, floorId });
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>Add Floor Area</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Area Name" />
      <input value={floorId} onChange={(e) => setFloorId(e.target.value)} placeholder="Floor ID" />
      <button type="submit">Add Floor Area</button>
    </form>
  );
};

export default AddFloorAreaForm;
