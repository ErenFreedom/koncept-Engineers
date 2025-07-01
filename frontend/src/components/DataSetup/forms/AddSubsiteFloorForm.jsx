import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../../context/AuthContext";
import { addEntity } from "../../../redux/actions/siteActions";
import { fetchHierarchyData } from "../../../redux/actions/hierarchyActions";
import "./FormStyles.css";

const AddSubsiteFloorForm = ({ data, setActiveForm }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
  const [name, setName] = useState("");
  const [floorLevel, setFloorLevel] = useState("");
  const [subsiteId, setSubsiteId] = useState("");

  useEffect(() => {
    if (data && data.name) {
      setName(data.name || "");
      setFloorLevel(data.floor_level || "");
      setSubsiteId(data.subsite_id || "");
    } else if (data && data.parentType === "subsite" && data.parentId) {
      setName("");
      setFloorLevel("");
      setSubsiteId(data.parentId);
    } else {
      setName("");
      setFloorLevel("");
      setSubsiteId("");
    }
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name, floor_level: floorLevel, subsite_id: subsiteId };
    await dispatch(addEntity("subsite-floor", payload, accessToken));
    dispatch(fetchHierarchyData(null, accessToken));
    setActiveForm(null);
    setName("");
    setFloorLevel("");
    setSubsiteId("");
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>{data && data.name ? "Edit Sub-site Floor" : "Add Sub-site Floor"}</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Floor Name" />
      <input value={floorLevel} onChange={(e) => setFloorLevel(e.target.value)} placeholder="Floor Level" />
      <label>Sub-site ID</label>
      <input value={subsiteId} readOnly placeholder="Sub-site ID" />
      <button type="submit">{data && data.name ? "Update Floor" : "Add Floor"}</button>
    </form>
  );
};

export default AddSubsiteFloorForm;
