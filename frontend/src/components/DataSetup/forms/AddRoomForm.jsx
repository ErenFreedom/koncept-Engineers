import React, { useState } from "react";
import "./FormStyles.css";

const AddRoomForm = () => {
  const [name, setName] = useState("");
  const [floorId, setFloorId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Room:", { name, floorId });
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>Add Room</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Room Name" />
      <input value={floorId} onChange={(e) => setFloorId(e.target.value)} placeholder="Floor ID" />
      <button type="submit">Add Room</button>
    </form>
  );
};

export default AddRoomForm;
