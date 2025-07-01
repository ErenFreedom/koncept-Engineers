import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../../context/AuthContext";
import { addSubsiteEntity } from "../../../redux/actions/subSiteStructureActions";
import { fetchHierarchyData } from "../../../redux/actions/hierarchyActions";
import "./FormStyles.css";

const AddSubsiteRoomSegmentForm = ({ data, setActiveForm }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [subsiteId, setSubsiteId] = useState("");

  useEffect(() => {
    console.log("🪵 AddSubsiteRoomSegmentForm data:", data);
    if (data) {
      setName(data.name || "");
      setRoomId(data.room_id ?? data.parentId ?? "");
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
    const payload = { name, room_id: roomId, subsite_id: subsiteId };
    await dispatch(addSubsiteEntity("room-segment", payload, accessToken));
    dispatch(fetchHierarchyData(null, accessToken));
    setActiveForm(null);
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>{data?.name ? "Edit Sub-site Room Segment" : "Add Sub-site Room Segment"}</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Segment Name" />
      <label>Room ID</label>
      <input value={roomId} readOnly placeholder="Room ID" />
      <label>Sub-site ID</label>
      <input value={subsiteId} readOnly placeholder="Sub-site ID" />
      <button type="submit">{data?.name ? "Update Segment" : "Add Segment"}</button>
    </form>
  );
};

export default AddSubsiteRoomSegmentForm;
