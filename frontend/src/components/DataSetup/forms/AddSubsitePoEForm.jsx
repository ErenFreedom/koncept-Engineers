import React, { useState, useEffect } from "react";
import "./FormStyles.css";

const AddSubsitePoEForm = ({ data, onSubmit }) => {
  const [name, setName] = useState("");
  const [locationType, setLocationType] = useState("");
  const [locationId, setLocationId] = useState("");
  const [subsiteId, setSubsiteId] = useState("");

  useEffect(() => {
    if (data) {
      setName(data.name || "");
      setLocationType(data.location_type || "");
      setLocationId(data.location_id || "");
      setSubsiteId(data.subsite_id || "");
    } else {
      setName("");
      setLocationType("");
      setLocationId("");
      setSubsiteId("");
    }
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, locationType, locationId, subsiteId });
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>{data ? "Edit Sub-site PoE" : "Add Sub-site PoE"}</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="PoE Name" />
      <input value={locationType} onChange={(e) => setLocationType(e.target.value)} placeholder="Location Type (e.g., room, floor)" />
      <input value={locationId} onChange={(e) => setLocationId(e.target.value)} placeholder="Location ID" />
      <input value={subsiteId} onChange={(e) => setSubsiteId(e.target.value)} placeholder="Sub-site ID" />
      <button type="submit">{data ? "Update PoE" : "Add PoE"}</button>
    </form>
  );
};

export default AddSubsitePoEForm;
