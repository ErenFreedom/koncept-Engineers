import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../../context/AuthContext";
import { addSubsiteEntity, editSubsiteEntity, deleteSubsiteEntity } from "../../../redux/actions/subSiteStructureActions";
import { fetchHierarchyData } from "../../../redux/actions/hierarchyActions";
import FormHeader from "../../common/FormHeader";
import "./FormStyles.css";

const AddSubsiteRoomForm = ({ data, setActiveForm }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
  const [name, setName] = useState("");
  const [floorId, setFloorId] = useState("");
  const [subsiteId, setSubsiteId] = useState("");

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
    await dispatch(addSubsiteEntity("room/add", payload, accessToken));
    dispatch(fetchHierarchyData(null, accessToken));
    setActiveForm(null);
  };

  const handleEdit = async () => {
    if (!data?.id) return;
    const payload = { id: data.id, name, floor_id: floorId, subsite_id: subsiteId };
    await dispatch(editSubsiteEntity("room/edit", payload, accessToken));
    dispatch(fetchHierarchyData(null, accessToken));
    setActiveForm(null);
  };

  const handleDelete = async () => {
    if (!data?.id) return;
    await dispatch(deleteSubsiteEntity("room/delete", { id: data.id }, accessToken));
    dispatch(fetchHierarchyData(null, accessToken));
    setActiveForm(null);
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <FormHeader
        title={data?.name ? "Edit Sub-site Room" : "Add Sub-site Room"}
        onEdit={handleEdit}
        onDelete={handleDelete}
        showEdit={!!data?.id}
        showDelete={!!data?.id}
      />
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Room Name" />
      <label>Floor ID</label>
      <input value={floorId} readOnly placeholder="Floor ID" />
      <label>Sub-site ID</label>
      <input value={subsiteId} readOnly placeholder="Sub-site ID" />
      <button type="submit">{data?.name ? "Update Room" : "Add Room"}</button>
    </form>
  );
};

export default AddSubsiteRoomForm;
