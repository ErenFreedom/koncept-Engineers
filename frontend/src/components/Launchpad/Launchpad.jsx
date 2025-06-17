import React from "react";
import "./Launchpad.css";
import { X } from "lucide-react";

const modules = [
  {
    id: "operation-manager",
    name: "Operation Manager",
    description: "Monitor and control building systems",
    icon: "🛠️",
  },
  {
    id: "data-setup",
    name: "Data Setup",
    description: "Configure hierarchy and data points",
    icon: "📊",
  },
  {
    id: "devices",
    name: "Devices",
    description: "Manage connected sensors and hardware",
    icon: "🔌",
  },
  {
    id: "account",
    name: "Account",
    description: "Manage user profiles and roles",
    icon: "👥",
  },
];

const Launchpad = ({ onClose, onSelect }) => {
  return (
    <div className="launchpad-overlay">
      <div className="launchpad-container">
        <div className="launchpad-header">
          <X className="launchpad-close" onClick={onClose} />
        </div>

        <div className="launchpad-grid">
          {modules.map((mod) => (
            <div
              className="launchpad-card"
              key={mod.id}
              onClick={() => onSelect(mod.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onSelect(mod.id);
                }
              }}
            >
              <div className="card-icon">{mod.icon}</div>
              <div className="card-title">{mod.name}</div>
              <div className="card-desc">{mod.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Launchpad;



