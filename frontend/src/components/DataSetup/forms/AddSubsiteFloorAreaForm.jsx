import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../../context/AuthContext";
import { addSubsiteEntity, editSubsiteEntity } from "../../../redux/actions/subSiteStructureActions";
import { fetchHierarchyData } from "../../../redux/actions/hierarchyActions";
import "./FormStyles.css";

const AddSubsiteFloorAreaForm = ({ data, setActiveForm }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
  const [name, setName] = useState("");
  const [floorId, setFloorId] = useState("");
  const [subsiteId, setSubsiteId] = useState("");

  const isEditing = !!data?.isEditing;

  useEffect(() => {
    if (isEditing && data) {
      setName(data.name || "");
      setFloorId(data.floor_id || "");
      setSubsiteId(data.subsite_id ?? data.subSiteId ?? "");
    } else if (data && data.parentId) {
      setName("");
      setFloorId(data.parentId);
      setSubsiteId(data.subsite_id ?? data.subSiteId ?? "");
    } else {
      setName("");
      setFloorId("");
      setSubsiteId("");
    }
  }, [data, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name, floor_id: floorId, subsite_id: subsiteId };
    if (isEditing) {
      await dispatch(editSubsiteEntity("floor-area/edit", { ...payload, id: data.id }, accessToken));
    } else {
      await dispatch(addSubsiteEntity("floor-area/add", payload, accessToken));
    }
    dispatch(fetchHierarchyData(null, accessToken));
    setActiveForm(null);
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>{isEditing ? "Edit Sub-site Floor Area" : "Add Sub-site Floor Area"}</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Area Name" />
      <label>Floor ID</label>
      <input value={floorId} readOnly placeholder="Floor ID" />
      <label>Sub-site ID</label>
      <input value={subsiteId} readOnly placeholder="Sub-site ID" />
      <button type="submit">{isEditing ? "Update Area" : "Add Floor Area"}</button>
    </form>
  );
};

export default AddSubsiteFloorAreaForm;
