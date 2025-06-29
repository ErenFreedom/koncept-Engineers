import React, { useState, useEffect } from "react";
import "./FormStyles.css";

const AddFloorAreaForm = ({ data, onSubmit }) => {
  const [name, setName] = useState("");
  const [floorId, setFloorId] = useState("");

  useEffect(() => {
    if (data) {
      setName(data.name || "");
      setFloorId(data.floor_id || "");
    } else {
      setName("");
      setFloorId("");
    }
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, floor_id: floorId });
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>{data ? "Edit Floor Area" : "Add Floor Area"}</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Area Name" />
      <input value={floorId} onChange={(e) => setFloorId(e.target.value)} placeholder="Floor ID" />
      <button type="submit">{data ? "Update Floor Area" : "Add Floor Area"}</button>
    </form>
  );
};

export default AddFloorAreaForm;
