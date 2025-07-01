import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../../context/AuthContext";
import { addEntity } from "../../../redux/actions/siteActions";
import { fetchHierarchyData } from "../../../redux/actions/hierarchyActions";
import "./FormStyles.css";

const AddSubsitePoEForm = ({ data, setDropdownAction }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name, location_type: locationType, location_id: locationId, subsite_id: subsiteId };
    await dispatch(addEntity("subsite-poe", payload, accessToken));
    dispatch(fetchHierarchyData(null, accessToken));
    setDropdownAction(null); // ✅ reset
    setName("");
    setLocationType("");
    setLocationId("");
    setSubsiteId("");
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
