import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../../context/AuthContext";
import { addSubsiteEntity, editSubsiteEntity, deleteSubsiteEntity } from "../../../redux/actions/subSiteStructureActions";
import { fetchHierarchyData } from "../../../redux/actions/hierarchyActions";
import FormHeader from "../../common/FormHeader";
import "./FormStyles.css";

const AddSubsiteFloorForm = ({ data, setActiveForm }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
  const [name, setName] = useState("");
  const [floorLevel, setFloorLevel] = useState("");
  const [subsiteId, setSubsiteId] = useState("");

  useEffect(() => {
    if (data) {
      setName(data.name || "");
      setFloorLevel(data.floor_level || "");
      setSubsiteId(data.subsite_id ?? data.subSiteId ?? data.parentId ?? data.id ?? "");
    }
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name, floor_level: floorLevel, subsite_id: subsiteId };
    await dispatch(addSubsiteEntity("floor/add", payload, accessToken));
    dispatch(fetchHierarchyData(null, accessToken));
    setActiveForm(null);
  };

  const handleEdit = async () => {
    if (!data?.id) return;
    const payload = { id: data.id, name, floor_level: floorLevel, subsite_id: subsiteId };
    await dispatch(editSubsiteEntity("floor/edit", payload, accessToken));
    dispatch(fetchHierarchyData(null, accessToken));
    setActiveForm(null);
  };

  const handleDelete = async () => {
    if (!data?.id) return;
    await dispatch(deleteSubsiteEntity("floor/delete", { id: data.id }, accessToken));
    dispatch(fetchHierarchyData(null, accessToken));
    setActiveForm(null);
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <FormHeader
        title={data?.name ? "Edit Sub-site Floor" : "Add Sub-site Floor"}
        onEdit={handleEdit}
        onDelete={handleDelete}
        showEdit={!!data?.id}
        showDelete={!!data?.id}
      />
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Floor Name" />
      <input value={floorLevel} onChange={(e) => setFloorLevel(e.target.value)} placeholder="Floor Level" />
      <label>Sub-site ID</label>
      <input value={subsiteId} readOnly placeholder="Sub-site ID" />
      <button type="submit">{data?.name ? "Update Floor" : "Add Floor"}</button>
    </form>
  );
};

export default AddSubsiteFloorForm;
