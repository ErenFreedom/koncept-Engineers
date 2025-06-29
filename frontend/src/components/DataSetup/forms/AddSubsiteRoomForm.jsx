import React, { useState, useEffect } from "react";
import "./FormStyles.css";

const AddSubsiteRoomForm = ({ data, onSubmit }) => {
  const [name, setName] = useState("");
  const [floorId, setFloorId] = useState("");
  const [subsiteId, setSubsiteId] = useState("");

  useEffect(() => {
    if (data) {
      setName(data.name || "");
      setFloorId(data.floor_id || "");
      setSubsiteId(data.subsite_id || "");
    } else {
      setName("");
      setFloorId("");
      setSubsiteId("");
    }
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, floorId, subsiteId });
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>{data ? "Edit Sub-site Room" : "Add Sub-site Room"}</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Room Name" />
      <input value={floorId} onChange={(e) => setFloorId(e.target.value)} placeholder="Floor ID" />
      <input value={subsiteId} onChange={(e) => setSubsiteId(e.target.value)} placeholder="Sub-site ID" />
      <button type="submit">{data ? "Update Room" : "Add Room"}</button>
    </form>
  );
};

export default AddSubsiteRoomForm;
