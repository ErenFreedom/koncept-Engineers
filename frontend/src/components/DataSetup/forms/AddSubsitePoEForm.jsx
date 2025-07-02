import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../../context/AuthContext";
import { addSubsiteEntity, editSubsiteEntity, deleteSubsiteEntity } from "../../../redux/actions/subSiteStructureActions";
import { fetchHierarchyData } from "../../../redux/actions/hierarchyActions";
import FormHeader from "../../common/FormHeader";
import "./FormStyles.css";

const AddSubsitePoEForm = ({ data, setActiveForm }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
  const [name, setName] = useState("");
  const [locationType, setLocationType] = useState("");
  const [locationId, setLocationId] = useState("");
  const [subsiteId, setSubsiteId] = useState("");

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
    const payload = { name, location_type: locationType, location_id: locationId, subsite_id: subsiteId };
    await dispatch(addSubsiteEntity("poe/add", payload, accessToken));
    dispatch(fetchHierarchyData(null, accessToken));
    setActiveForm(null);
  };

  const handleEdit = async () => {
    if (!data?.id) return;
    const payload = { id: data.id, name, location_type: locationType, location_id: locationId, subsite_id: subsiteId };
    await dispatch(editSubsiteEntity("poe/edit", payload, accessToken));
    dispatch(fetchHierarchyData(null, accessToken));
    setActiveForm(null);
  };

  const handleDelete = async () => {
    if (!data?.id) return;
    await dispatch(deleteSubsiteEntity("poe/delete", { id: data.id }, accessToken));
    dispatch(fetchHierarchyData(null, accessToken));
    setActiveForm(null);
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <FormHeader
        title={data?.name ? "Edit Sub-site PoE" : "Add Sub-site PoE"}
        onEdit={handleEdit}
        onDelete={handleDelete}
        showEdit={!!data?.id}
        showDelete={!!data?.id}
      />
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="PoE Name" />
      <label>Location Type</label>
      <input value={locationType} readOnly placeholder="Location Type (e.g., room, floor)" />
      <label>Location ID</label>
      <input value={locationId} readOnly placeholder="Location ID" />
      <label>Sub-site ID</label>
      <input value={subsiteId} readOnly placeholder="Sub-site ID" />
      <button type="submit">{data?.name ? "Update PoE" : "Add PoE"}</button>
    </form>
  );
};

export default AddSubsitePoEForm;
