import React, { useState } from "react";
import "./FormStyles.css";

const AddSubsitePoEForm = () => {
  const [name, setName] = useState("");
  const [locationType, setLocationType] = useState("");
  const [locationId, setLocationId] = useState("");
  const [subsiteId, setSubsiteId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Sub-site PoE:", { name, locationType, locationId, subsiteId });
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>Add Sub-site PoE</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="PoE Name" />
      <input value={locationType} onChange={(e) => setLocationType(e.target.value)} placeholder="Location Type (e.g., room, floor)" />
      <input value={locationId} onChange={(e) => setLocationId(e.target.value)} placeholder="Location ID" />
      <input value={subsiteId} onChange={(e) => setSubsiteId(e.target.value)} placeholder="Sub-site ID" />
      <button type="submit">Add PoE</button>
    </form>
  );
};

export default AddSubsitePoEForm;
