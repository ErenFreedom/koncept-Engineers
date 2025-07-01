import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../../context/AuthContext";
import { addEntity } from "../../../redux/actions/siteActions";
import { fetchHierarchyData } from "../../../redux/actions/hierarchyActions";
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
    setName("");
    setLevel("");
    setSiteId("");
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>{data && data.name ? "Edit Floor" : "Add Floor"}</h3>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Floor Name"
      />
      <input
        type="number"
        value={level}
        onChange={(e) => setLevel(e.target.value)}
        placeholder="Floor Level"
      />
      {siteId && (
        <>
          <label>Site ID</label>
          <input value={siteId} readOnly placeholder="Site ID" />
        </>
      )}
      <button type="submit">
        {data && data.name ? "Update Floor" : "Add Floor"}
      </button>
    </form>
  );
};

export default AddFloorForm;
