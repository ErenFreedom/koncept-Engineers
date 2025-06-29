import React, { useState, useEffect } from "react";
import "./FormStyles.css";

const AddFloorForm = ({ data, onSubmit }) => {
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");

  useEffect(() => {
    if (data) {
      setName(data.name || "");
      setLevel(data.floor_level || "");
    } else {
      setName("");
      setLevel("");
    }
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, floor_level: level });
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>{data ? "Edit Floor" : "Add Floor"}</h3>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Floor Name"
      />
      <input
        type="number"
        value={level}
        onChange={(e) => setLevel(e.target.value)}
        placeholder="Floor Level"
      />
      <button type="submit">{data ? "Update Floor" : "Add Floor"}</button>
    </form>
  );
};

export default AddFloorForm;
