import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../../context/AuthContext";
import { addEntity, editEntity, deleteEntity } from "../../../redux/actions/siteActions";
import { fetchHierarchyData } from "../../../redux/actions/hierarchyActions";
import FormHeader from "../../common/FormHeader";
import "./FormStyles.css";

const AddFloorAreaForm = ({ data, setActiveForm }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
  const [name, setName] = useState("");
  const [floorId, setFloorId] = useState("");

  useEffect(() => {
    if (data && data.name) {
      setName(data.name || "");
      setFloorId(data.floor_id || "");
    } else if (data && data.parentType === "floor" && data.parentId) {
      setName("");
      setFloorId(data.parentId);
    } else {
      setName("");
      setFloorId("");
    }
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name, floor_id: floorId };
    await dispatch(addEntity("floor-area", payload, accessToken));
    dispatch(fetchHierarchyData(null, accessToken));
    setActiveForm(null);
  };

  const handleEdit = async () => {
    if (!data?.id) return;
    const payload = { id: data.id, name, floor_id: floorId };
    await dispatch(editEntity("floor-area", payload, accessToken));
    dispatch(fetchHierarchyData(null, accessToken));
    setActiveForm(null);
  };

  const handleDelete = async () => {
    if (!data?.id) return;
    await dispatch(deleteEntity("floor-area", data.id, accessToken));
    dispatch(fetchHierarchyData(null, accessToken));
    setActiveForm(null);
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <FormHeader
        title={data?.name ? "Edit Floor Area" : "Add Floor Area"}
        onEdit={handleEdit}
        onDelete={handleDelete}
        showEdit={!!data?.id}
        showDelete={!!data?.id}
      />
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Area Name" />
      <label>Floor ID</label>
      <input value={floorId} readOnly placeholder="Floor ID" />
      <button type="submit">{data?.name ? "Update Floor Area" : "Add Floor Area"}</button>
    </form>
  );
};

export default AddFloorAreaForm;
