import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../../context/AuthContext";
import { addEntity, editEntity, deleteEntity } from "../../../redux/actions/siteActions";
import { fetchHierarchyData } from "../../../redux/actions/hierarchyActions";
import FormHeader from "../../common/FormHeader";
import "./FormStyles.css";

const AddRoomSegmentForm = ({ data, setActiveForm }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    if (data && data.name) {
      setName(data.name || "");
      setRoomId(data.room_id || "");
    } else if (data && data.parentType === "room" && data.parentId) {
      setName("");
      setRoomId(data.parentId);
    } else {
      setName("");
      setRoomId("");
    }
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name, room_id: roomId };
    await dispatch(addEntity("room-segment", payload, accessToken));
    dispatch(fetchHierarchyData(null, accessToken));
    setActiveForm(null);
  };

  const handleEdit = async () => {
    if (!data?.id) return;
    const payload = { id: data.id, name, room_id: roomId };
    await dispatch(editEntity("room-segment", payload, accessToken));
    dispatch(fetchHierarchyData(null, accessToken));
    setActiveForm(null);
  };

  const handleDelete = async () => {
    if (!data?.id) return;
    await dispatch(deleteEntity("room-segment", data.id, accessToken));
    dispatch(fetchHierarchyData(null, accessToken));
    setActiveForm(null);
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <FormHeader
        title={data?.name ? "Edit Room Segment" : "Add Room Segment"}
        onEdit={handleEdit}
        onDelete={handleDelete}
        showEdit={!!data?.id}
        showDelete={!!data?.id}
      />
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Segment Name" />
      <label>Room ID</label>
      <input value={roomId} readOnly placeholder="Room ID" />
      <button type="submit">{data?.name ? "Update Segment" : "Add Segment"}</button>
    </form>
  );
};

export default AddRoomSegmentForm;
