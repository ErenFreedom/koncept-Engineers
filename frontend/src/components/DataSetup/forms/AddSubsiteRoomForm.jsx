import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../../context/AuthContext";
import { addSubsiteEntity, editSubsiteEntity } from "../../../redux/actions/subSiteStructureActions";
import { fetchHierarchyData } from "../../../redux/actions/hierarchyActions";
import "./FormStyles.css";

const AddSubsiteRoomForm = ({ data, setActiveForm }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
  const [name, setName] = useState("");
  const [floorId, setFloorId] = useState("");
  const [subsiteId, setSubsiteId] = useState("");
  const isEditing = data?.isEditing || false;

  useEffect(() => {
    if (data) {
      setName(data.name || "");
      setFloorId(data.floor_id ?? data.parentId ?? "");
      setSubsiteId(data.subsite_id ?? data.subSiteId ?? "");
    }
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name, floor_id: floorId, subsite_id: subsiteId };
    if (isEditing) {
      await dispatch(editSubsiteEntity("room/edit", { ...payload, id: data.id }, accessToken));
    } else {
      await dispatch(addSubsiteEntity("room/add", payload, accessToken));
    }
    dispatch(fetchHierarchyData(null, accessToken));
    setActiveForm(null);
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>{isEditing ? "Edit Sub-site Room" : "Add Sub-site Room"}</h3>
      <input value={name} onChange={(e) => isEditing && setName(e.target.value)} placeholder="Room Name" readOnly={!isEditing && !!data?.name} />
      <label>Floor ID</label>
      <input value={floorId} readOnly placeholder="Floor ID" />
      <label>Sub-site ID</label>
      <input value={subsiteId} readOnly placeholder="Sub-site ID" />
      <button type="submit">{isEditing ? "Update Room" : "Add Room"}</button>
    </form>
  );
};

export default AddSubsiteRoomForm;
