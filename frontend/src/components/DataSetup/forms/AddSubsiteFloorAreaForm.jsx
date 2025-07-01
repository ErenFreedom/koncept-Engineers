import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../../context/AuthContext";
import { addEntity } from "../../../redux/actions/siteActions";
import { fetchHierarchyData } from "../../../redux/actions/hierarchyActions";
import "./FormStyles.css";

const AddSubsiteFloorAreaForm = ({ data, setDropdownAction }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
  const [name, setName] = useState("");
  const [floorId, setFloorId] = useState("");
  const [subsiteId, setSubsiteId] = useState("");

  useEffect(() => {
    if (data && data.name) {
      setName(data.name || "");
      setFloorId(data.floor_id || "");
      setSubsiteId(data.subsite_id || "");
    } else if (data && data.parentType === "subsite-floor" && data.parentId) {
      setName("");
      setFloorId(data.parentId);
      setSubsiteId(data.subsiteId);
    } else {
      setName("");
      setFloorId("");
      setSubsiteId("");
    }
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name, floor_id: floorId, subsite_id: subsiteId };
    await dispatch(addEntity("subsite-floor-area", payload, accessToken));
    dispatch(fetchHierarchyData(null, accessToken));
    setDropdownAction(null);
    setName("");
    setFloorId("");
    setSubsiteId("");
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>{data && data.name ? "Edit Sub-site Floor Area" : "Add Sub-site Floor Area"}</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Area Name" />
      <input value={floorId} onChange={(e) => setFloorId(e.target.value)} placeholder="Floor ID" />
      <input value={subsiteId} onChange={(e) => setSubsiteId(e.target.value)} placeholder="Sub-site ID" />
      <button type="submit">{data && data.name ? "Update Area" : "Add Floor Area"}</button>
    </form>
  );
};

export default AddSubsiteFloorAreaForm;
