import React from "react";
import "./FormHeader.css";

const FormHeader = ({ title, onEdit, onDelete, showEdit = true, showDelete = true }) => {
  return (
    <div className="form-header">
      <h3 className="form-header-title">{title}</h3>
      <div className="form-header-actions">
        {showEdit && <button type="button" className="edit-btn" onClick={onEdit}>✏️ Edit</button>}
        {showDelete && <button type="button" className="delete-btn" onClick={onDelete}>🗑️ Delete</button>}
      </div>
    </div>
  );
};

export default FormHeader;
