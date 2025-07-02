import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../../context/AuthContext";
import { addEntity } from "../../../redux/actions/siteActions";
import { fetchHierarchyData } from "../../../redux/actions/hierarchyActions";
import "./FormStyles.css";

const AddFloorAreaForm = ({ data, setActiveForm }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
  const [name, setName] = useState("");
  const [floorId, setFloorId] = useState("");

  useEffect(() => {
    if (data && data.name) {
      // Editing existing area: populate fields
      setName(data.name || "");
      setFloorId(data.floor_id || "");
    } else if (data && data.parentType === "floor" && data.parentId) {
      // Adding new area to a floor: set floorId automatically
      setName("");
      setFloorId(data.parentId);
    } else {
      // Default
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
    setName("");
    setFloorId("");
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>{data && data.name ? "Edit Floor Area" : "Add Floor Area"}</h3>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Area Name"
      />
      <label>Floor ID</label>
      <input
        value={floorId}
        readOnly
        placeholder="Floor ID"
      />
      <button type="submit">
        {data && data.name ? "Update Floor Area" : "Add Floor Area"}
      </button>
    </form>
  );
};

export default AddFloorAreaForm;
