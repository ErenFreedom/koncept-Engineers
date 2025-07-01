import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../../context/AuthContext";
import { addEntity } from "../../../redux/actions/siteActions";
import { fetchHierarchyData } from "../../../redux/actions/hierarchyActions";
import "./FormStyles.css";

const AddFloorForm = ({ data, setDropdownAction }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");

  useEffect(() => {
    if (data && data.name) {
      setName(data.name || "");
      setLevel(data.floor_level || "");
    } else {
      setName("");
      setLevel("");
    }
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name, floor_level: level, site_id: data?.parentId || null };
    await dispatch(addEntity("floor", payload, accessToken));
    dispatch(fetchHierarchyData(null, accessToken));
    setDropdownAction(null);
    setName("");
    setLevel("");
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>{data && data.name ? "Edit Floor" : "Add Floor"}</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Floor Name" />
      <input type="number" value={level} onChange={(e) => setLevel(e.target.value)} placeholder="Floor Level" />
      <button type="submit">{data && data.name ? "Update Floor" : "Add Floor"}</button>
    </form>
  );
};

export default AddFloorForm;
