import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../../context/AuthContext";
import { addEntity } from "../../../redux/actions/siteActions";
import { fetchHierarchyData } from "../../../redux/actions/hierarchyActions";
import "./FormStyles.css";

const AddSubsitePoEForm = ({ data, setActiveForm }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
  const [name, setName] = useState("");
  const [locationType, setLocationType] = useState("");
  const [locationId, setLocationId] = useState("");
  const [subsiteId, setSubsiteId] = useState("");

  useEffect(() => {
    if (data && data.name) {
      setName(data.name || "");
      setLocationType(data.location_type || "");
      setLocationId(data.location_id || "");
      setSubsiteId(data.subsite_id || "");
    } else if (data && data.parentType && data.parentId) {
      setName("");
      setLocationType(data.parentType);
      setLocationId(data.parentId);
      setSubsiteId(data.subsiteId);
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
    setActiveForm(null);
    setName("");
    setLocationType("");
    setLocationId("");
    setSubsiteId("");
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>{data && data.name ? "Edit Sub-site PoE" : "Add Sub-site PoE"}</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="PoE Name" />
      <label>Location Type</label>
      <input value={locationType} readOnly placeholder="Location Type (e.g., room, floor)" />
      <label>Location ID</label>
      <input value={locationId} readOnly placeholder="Location ID" />
      <label>Sub-site ID</label>
      <input value={subsiteId} readOnly placeholder="Sub-site ID" />
      <button type="submit">{data && data.name ? "Update PoE" : "Add PoE"}</button>
    </form>
  );
};

export default AddSubsitePoEForm;
