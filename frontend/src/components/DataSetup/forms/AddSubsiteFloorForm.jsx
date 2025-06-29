import React, { useState, useEffect } from "react";
import "./FormStyles.css";

const AddSubsiteFloorForm = ({ data, onSubmit }) => {
  const [name, setName] = useState("");
  const [floorLevel, setFloorLevel] = useState("");
  const [subsiteId, setSubsiteId] = useState("");

  useEffect(() => {
    if (data) {
      setName(data.name || "");
      setFloorLevel(data.floor_level || "");
      setSubsiteId(data.subsite_id || "");
    } else {
      setName("");
      setFloorLevel("");
      setSubsiteId("");
    }
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, floorLevel, subsiteId });
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>{data ? "Edit Sub-site Floor" : "Add Sub-site Floor"}</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Floor Name" />
      <input value={floorLevel} onChange={(e) => setFloorLevel(e.target.value)} placeholder="Floor Level" />
      <input value={subsiteId} onChange={(e) => setSubsiteId(e.target.value)} placeholder="Sub-site ID" />
      <button type="submit">{data ? "Update Floor" : "Add Floor"}</button>
    </form>
  );
};

export default AddSubsiteFloorForm;
