import React, { useState } from "react";
import "./Hierarchy.css";
import { useAuth } from "../../../context/AuthContext";
import HierarchyTree from "./HierarchyTree";

import AddFloorForm from "../forms/AddFloorForm";
import AddRoomForm from "../forms/AddRoomForm";
import AddFloorAreaForm from "../forms/AddFloorAreaForm";
import AddRoomSegmentForm from "../forms/AddRoomSegmentForm";
import AddPieceOfEquipmentForm from "../forms/AddPieceOfEquipmentForm";
import RegisterSubSiteForm from "../forms/RegisterSubSiteForm";
import AddSubsiteFloorForm from "../forms/AddSubsiteFloorForm";
import AddSubsiteRoomForm from "../forms/AddSubsiteRoomForm";
import AddSubsiteFloorAreaForm from "../forms/AddSubsiteFloorAreaForm";
import AddSubsiteRoomSegmentForm from "../forms/AddSubsiteRoomSegmentForm";
import AddSubsitePoEForm from "../forms/AddSubsitePoEForm";
import MainSiteInfoForm from "../forms/MainSiteInfoForm";

const Hierarchy = () => {
  const { admin } = useAuth();
  const [expandedNodes, setExpandedNodes] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownAction, setDropdownAction] = useState(null);

  const toggleNode = (parent, index) => {
    const key = `${parent}-${index}`;
    setExpandedNodes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleNodeClick = (label, type) => {
    setSelectedNode({ label, type });
    setDropdownAction(null); // reset form
  };

  const handleDropdownSelect = (actionType) => {
    setDropdownAction(actionType);
    setShowDropdown(false);
  };

  const allowedForms = {
    "main-site": ["floor"],
    floor: ["room"],
    room: ["floor-area", "room-segment", "poe"],
    "floor-area": [],
    "room-segment": [],
    poe: [],
    subsite: ["subsite-floor"],
    "subsite-floor": ["subsite-room"],
    "subsite-room": ["subsite-floor-area", "subsite-room-segment", "subsite-poe"],
    "subsite-floor-area": [],
    "subsite-room-segment": [],
    "subsite-poe": [],
  };

  const labelMap = {
    floor: "Add Floor",
    room: "Add Room",
    "floor-area": "Add Floor Area",
    "room-segment": "Add Room Segment",
    poe: "Add Piece of Equipment",
    subsite: "Register Sub-site",
    "subsite-floor": "Add Subsite Floor",
    "subsite-room": "Add Subsite Room",
    "subsite-floor-area": "Add Subsite Floor Area",
    "subsite-room-segment": "Add Subsite Room Segment",
    "subsite-poe": "Add Subsite PoE",
  };

  const renderFormForAction = (actionType) => {
    switch (actionType) {
      case "floor":
        return <AddFloorForm />;
      case "room":
        return <AddRoomForm />;
      case "floor-area":
        return <AddFloorAreaForm />;
      case "room-segment":
        return <AddRoomSegmentForm />;
      case "poe":
        return <AddPieceOfEquipmentForm />;
      case "subsite":
        return <RegisterSubSiteForm />;
      case "subsite-floor":
        return <AddSubsiteFloorForm />;
      case "subsite-room":
        return <AddSubsiteRoomForm />;
      case "subsite-floor-area":
        return <AddSubsiteFloorAreaForm />;
      case "subsite-room-segment":
        return <AddSubsiteRoomSegmentForm />;
      case "subsite-poe":
        return <AddSubsitePoEForm />;
      default:
        return <p className="no-selection">🛈 Select a node and action to view a form.</p>;
    }
  };

  const dummyTree = [
    {
      site: `Main Site - ${admin?.companyName || "Company"}`,
      children: [
        {
          name: "Floor 1",
          children: [
            {
              name: "Room A",
              children: ["PoE 1", "Room Segment A", "Floor Area A"],
            },
          ],
        },
      ],
    },
    {
      site: "Subsite - Block 1",
      children: [
        {
          name: "Subsite Floor A",
          children: [
            {
              name: "Subsite Room B",
              children: ["Subsite PoE X", "Subsite Room Segment Y"],
            },
          ],
        },
      ],
    },
  ];

  return (
    <div className="hierarchy-tab">
      {/* 🔍 Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search site, building, floor, or room..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Main Layout */}
      <div className="hierarchy-container">
        {/* 🌳 Tree Panel */}
        <div className="tree-panel" style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>Hierarchy Tree</h3>
            <div className="three-dot-menu" onClick={() => setShowDropdown(!showDropdown)}>⋮</div>
          </div>

          <div className="tree-list">
            <HierarchyTree
              treeData={dummyTree.map((s) => ({ ...s, name: s.site }))}
              onSelect={handleNodeClick}
            />
          </div>

          {/* 🎯 Context Dropdown */}
          {showDropdown && selectedNode?.type && (
            <div className="context-dropdown">
              {(Object.keys(labelMap) || []).map((key) => (
                <button
                  key={key}
                  onClick={() => handleDropdownSelect(key)}
                  disabled={
                    !allowedForms[selectedNode.type] ||
                    !allowedForms[selectedNode.type].includes(key)
                  }
                >
                  {labelMap[key]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 📄 Form Panel */}
        <div className="form-panel">
          <div className="form-box">
            <h4>{selectedNode?.label || "Site Name"}</h4>
            {dropdownAction ? renderFormForAction(dropdownAction) : (
              <p className="no-selection">🛈 Use the ⋮ menu to select what to add</p>
            )}
          </div>

          <div className="form-box">
            <h4>Relationships</h4>
            <p>Relationships Form Placeholder</p>
          </div>

          <div className="form-box">
            <h4>Tags</h4>
            <p>Tags Form Placeholder</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hierarchy;
