import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../../context/AuthContext";
import { addSubsiteEntity } from "../../../redux/actions/subSiteStructureActions";
import { fetchHierarchyData } from "../../../redux/actions/hierarchyActions";
import "./FormStyles.css";

const AddSubsiteRoomForm = ({ data, setActiveForm }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
  const [name, setName] = useState("");
  const [floorId, setFloorId] = useState("");
  const [subsiteId, setSubsiteId] = useState("");

  useEffect(() => {
    console.log("🪵 AddSubsiteRoomForm data:", data);
    if (data) {
      setName(data.name || "");
      setFloorId(data.floor_id ?? data.parentId ?? "");
      setSubsiteId(
        data.subsite_id ??
        data.subSiteId ??
        data.subsiteId ??
        ""
      );
    }
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name, floor_id: floorId, subsite_id: subsiteId };
    await dispatch(addSubsiteEntity("room", payload, accessToken));
    dispatch(fetchHierarchyData(null, accessToken));
    setActiveForm(null);
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>{data?.name ? "Edit Sub-site Room" : "Add Sub-site Room"}</h3>
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
