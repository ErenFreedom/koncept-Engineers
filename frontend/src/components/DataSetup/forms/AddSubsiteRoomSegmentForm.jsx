import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../../context/AuthContext";
import { addEntity } from "../../../redux/actions/siteActions";
import { fetchHierarchyData } from "../../../redux/actions/hierarchyActions";
import "./FormStyles.css";

const AddSubsiteRoomSegmentForm = ({ data, setDropdownAction }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [subsiteId, setSubsiteId] = useState("");

  useEffect(() => {
    if (data && data.name) {
      setName(data.name || "");
      setRoomId(data.room_id || "");
      setSubsiteId(data.subsite_id || "");
    } else if (data && data.parentType === "subsite-room" && data.parentId) {
      setName("");
      setRoomId(data.parentId);
      setSubsiteId(data.subsiteId);
    } else {
      setName("");
      setRoomId("");
      setSubsiteId("");
    }
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name, room_id: roomId, subsite_id: subsiteId };
    await dispatch(addEntity("subsite-room-segment", payload, accessToken));
    dispatch(fetchHierarchyData(null, accessToken));
    setDropdownAction(null);
    setName("");
    setRoomId("");
    setSubsiteId("");
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>{data && data.name ? "Edit Sub-site Room Segment" : "Add Sub-site Room Segment"}</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Segment Name" />
      <input value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="Room ID" />
      <input value={subsiteId} onChange={(e) => setSubsiteId(e.target.value)} placeholder="Sub-site ID" />
      <button type="submit">{data && data.name ? "Update Segment" : "Add Segment"}</button>
    </form>
  );
};

export default AddSubsiteRoomSegmentForm;
