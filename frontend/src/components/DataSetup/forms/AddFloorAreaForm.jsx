import React, { useState } from "react";
import "./FormStyles.css";

const AddFloorForm = () => {
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Floor:", { name, level });
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>Add Floor</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Floor Name" />
      <input type="number" value={level} onChange={(e) => setLevel(e.target.value)} placeholder="Floor Level" />
      <button type="submit">Add Floor</button>
    </form>
  );
};

export default AddFloorForm;
