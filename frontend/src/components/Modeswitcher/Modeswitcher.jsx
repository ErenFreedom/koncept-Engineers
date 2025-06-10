import React from "react";
import { useMode } from "../../context/ModeContext";

const ModeSwitcher = () => {
  const { mode, setMode, MODES } = useMode();

  const handleChange = (e) => {
    setMode(e.target.value);
  };

  return (
    <div className="absolute top-4 right-6 z-50">
      <select
        value={mode}
        onChange={handleChange}
        className="bg-gradient-to-r from-[#112d4e] to-[#0a1b30] text-white font-semibold px-4 py-2 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
      >
        <option value={MODES.ENGINEERING}>Engineering</option>
        <option value={MODES.OPERATIONAL}>Operational</option>
      </select>
    </div>
  );
};

export default ModeSwitcher;
