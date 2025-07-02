import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../../context/AuthContext";
import { addSubsiteEntity, editSubsiteEntity } from "../../../redux/actions/subSiteStructureActions";
import { fetchHierarchyData } from "../../../redux/actions/hierarchyActions";
import "./FormStyles.css";

const AddSubsitePoEForm = ({ data, setActiveForm }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
  const [name, setName] = useState("");
  const [locationType, setLocationType] = useState("");
  const [locationId, setLocationId] = useState("");
  const [subsiteId, setSubsiteId] = useState("");

  const isEditing = !!data?.isEditing; 

  useEffect(() => {
    if (data) {
      setName(data.name || "");
      setLocationType(data.location_type ?? data.parentType ?? "");
      setLocationId(data.location_id ?? data.parentId ?? "");
      setSubsiteId(data.subsite_id ?? data.subSiteId ?? "");
    }
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      location_type: locationType,
      location_id: locationId,
      subsite_id: subsiteId,
    };
    if (isEditing) {
      await dispatch(editSubsiteEntity("poe/edit", { ...payload, id: data.id }, accessToken));
    } else {
      await dispatch(addSubsiteEntity("poe/add", payload, accessToken));
    }
    dispatch(fetchHierarchyData(null, accessToken));
    setActiveForm(null);
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>{isEditing ? "Edit Sub-site PoE" : "Add Sub-site PoE"}</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="PoE Name" readOnly={!isEditing && !!data?.name} />
      <label>Location Type</label>
      <input value={locationType} readOnly placeholder="Location Type (e.g., room, floor)" />
      <label>Location ID</label>
      <input value={locationId} readOnly placeholder="Location ID" />
      <label>Sub-site ID</label>
      <input value={subsiteId} readOnly placeholder="Sub-site ID" />
      <button type="submit">{isEditing ? "Update PoE" : "Add PoE"}</button>
    </form>
  );
};

export default AddSubsitePoEForm;
