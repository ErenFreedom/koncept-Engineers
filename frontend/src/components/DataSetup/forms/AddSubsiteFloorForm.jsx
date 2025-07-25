import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../../context/AuthContext";
import { addSubsiteEntity, editSubsiteEntity } from "../../../redux/actions/subSiteStructureActions";
import { fetchHierarchyData } from "../../../redux/actions/hierarchyActions";
import "./FormStyles.css";

const AddSubsiteFloorForm = ({ data, setActiveForm }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
  const [name, setName] = useState("");
  const [floorLevel, setFloorLevel] = useState("");
  const [subsiteId, setSubsiteId] = useState("");

  const isEditing = !!data?.isEditing;

  useEffect(() => {
    if (isEditing && data) {
      setName(data.name || "");
      setFloorLevel(data.floor_level || "");
      setSubsiteId(data.subsite_id ?? data.subSiteId ?? "");
    } else if (data && data.parentId) {
      setName("");
      setFloorLevel("");
      setSubsiteId(data.subsite_id ?? data.subSiteId ?? data.parentId ?? "");
    } else {
      setName("");
      setFloorLevel("");
      setSubsiteId("");
    }
  }, [data, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name, floor_level: floorLevel, subsite_id: subsiteId };
    if (isEditing) {
      await dispatch(editSubsiteEntity("floor/edit", { ...payload, id: data.id }, accessToken));
    } else {
      await dispatch(addSubsiteEntity("floor/add", payload, accessToken));
    }
    dispatch(fetchHierarchyData(null, accessToken));
    setActiveForm(null);
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>{isEditing ? "Edit Sub-site Floor" : "Add Sub-site Floor"}</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Floor Name" />
      <input value={floorLevel} onChange={(e) => setFloorLevel(e.target.value)} placeholder="Floor Level" />
      <label>Sub-site ID</label>
      <input value={subsiteId} readOnly placeholder="Sub-site ID" />
      <button type="submit">{isEditing ? "Update Floor" : "Add Floor"}</button>
    </form>
  );
};

export default AddSubsiteFloorForm;
