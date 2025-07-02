import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../../context/AuthContext";
import { addEntity, editEntity, deleteEntity } from "../../../redux/actions/siteActions";
import { fetchHierarchyData } from "../../../redux/actions/hierarchyActions";
import FormHeader from "../../common/FormHeader";
import "./FormStyles.css";

const AddFloorForm = ({ data, setActiveForm }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [siteId, setSiteId] = useState("");

  useEffect(() => {
    if (data && data.name) {
      setName(data.name || "");
      setLevel(data.floor_level || "");
      setSiteId(data.site_id || "");
    } else if (data && data.parentType === "main-site" && data.parentId) {
      setName("");
      setLevel("");
      setSiteId(data.parentId);
    } else {
      setName("");
      setLevel("");
      setSiteId("");
    }
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name, floor_level: level, site_id: siteId };
    await dispatch(addEntity("floor", payload, accessToken));
    dispatch(fetchHierarchyData(null, accessToken));
    setActiveForm(null);
  };

  const handleEdit = async () => {
    if (!data?.id) return;
    const payload = { id: data.id, name, floor_level: level, site_id: siteId };
    await dispatch(editEntity("floor", payload, accessToken));
    dispatch(fetchHierarchyData(null, accessToken));
    setActiveForm(null);
  };

  const handleDelete = async () => {
    if (!data?.id) return;
    await dispatch(deleteEntity("floor", data.id, accessToken));
    dispatch(fetchHierarchyData(null, accessToken));
    setActiveForm(null);
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <FormHeader
        title={data?.name ? "Edit Floor" : "Add Floor"}
        onEdit={handleEdit}
        onDelete={handleDelete}
        showEdit={!!data?.id}
        showDelete={!!data?.id}
      />
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Floor Name" />
      <input type="number" value={level} onChange={(e) => setLevel(e.target.value)} placeholder="Floor Level" />
      {siteId && (
        <>
          <label>Site ID</label>
          <input value={siteId} readOnly placeholder="Site ID" />
        </>
      )}
      <button type="submit">{data?.name ? "Update Floor" : "Add Floor"}</button>
    </form>
  );
};

export default AddFloorForm;
