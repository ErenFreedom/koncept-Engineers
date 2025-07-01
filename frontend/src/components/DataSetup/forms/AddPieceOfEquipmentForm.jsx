import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../../context/AuthContext";
import { addEntity } from "../../../redux/actions/siteActions";
import { fetchHierarchyData } from "../../../redux/actions/hierarchyActions";
import "./FormStyles.css";

const AddPieceOfEquipmentForm = ({ data, setDropdownAction }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    installation_date: "",
    model: "",
    year_of_manufacture: "",
    discipline: "",
    type: "",
    subtype: "",
    serial_number: "",
    manufacturer: "",
    comment: "",
    location_type: "site",
    location_id: "",
  });

  useEffect(() => {
    if (data) {
      setFormData((prev) => ({
        ...prev,
        name: data.name || "",
        installation_date: data.installation_date || "",
        model: data.model || "",
        year_of_manufacture: data.year_of_manufacture || "",
        discipline: data.discipline || "",
        type: data.type || "",
        subtype: data.subtype || "",
        serial_number: data.serial_number || "",
        manufacturer: data.manufacturer || "",
        comment: data.comment || "",
        location_type: data.location_type || "site",
        location_id: data.location_id || "",
      }));
    } else {
      setFormData({
        name: "",
        installation_date: "",
        model: "",
        year_of_manufacture: "",
        discipline: "",
        type: "",
        subtype: "",
        serial_number: "",
        manufacturer: "",
        comment: "",
        location_type: "site",
        location_id: "",
      });
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(addEntity("poe", formData, accessToken));
    dispatch(fetchHierarchyData(null, accessToken));
    setDropdownAction(null); // ✅ reset
    setFormData({
      name: "",
      installation_date: "",
      model: "",
      year_of_manufacture: "",
      discipline: "",
      type: "",
      subtype: "",
      serial_number: "",
      manufacturer: "",
      comment: "",
      location_type: "site",
      location_id: "",
    });
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>{data ? "Edit Piece of Equipment" : "Add Piece of Equipment"}</h3>
      <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" />
      <input name="installation_date" type="date" value={formData.installation_date} onChange={handleChange} />
      <input name="model" value={formData.model} onChange={handleChange} placeholder="Model" />
      <input name="year_of_manufacture" value={formData.year_of_manufacture} onChange={handleChange} placeholder="Year of Manufacture" />
      <input name="discipline" value={formData.discipline} onChange={handleChange} placeholder="Discipline" />
      <input name="type" value={formData.type} onChange={handleChange} placeholder="Type" />
      <input name="subtype" value={formData.subtype} onChange={handleChange} placeholder="Subtype" />
      <input name="serial_number" value={formData.serial_number} onChange={handleChange} placeholder="Serial Number" />
      <input name="manufacturer" value={formData.manufacturer} onChange={handleChange} placeholder="Manufacturer" />
      <textarea name="comment" value={formData.comment} onChange={handleChange} placeholder="Comment" rows={3} />
      <select name="location_type" value={formData.location_type} onChange={handleChange}>
        <option value="site">Site</option>
        <option value="floor">Floor</option>
        <option value="floor_area">Floor Area</option>
        <option value="room">Room</option>
        <option value="room_segment">Room Segment</option>
      </select>
      <input name="location_id" value={formData.location_id} onChange={handleChange} placeholder="Location ID" />
      <button type="submit">{data ? "Update Equipment" : "Add Equipment"}</button>
    </form>
  );
};

export default AddPieceOfEquipmentForm;
