import React, { useState } from "react";
import "./ModalInput.css";

const ModalInput = ({ title, placeholder, onClose, onSubmit }) => {
  const [input, setInput] = useState("");

  const handleConfirm = () => {
    if (input.trim()) {
      onSubmit(input.trim());
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>{title}</h3>
        <input
          type="text"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleConfirm}>Add</button>
        </div>
      </div>
    </div>
  );
};

export default ModalInput;
