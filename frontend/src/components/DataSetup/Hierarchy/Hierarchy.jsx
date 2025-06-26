import React, { useState } from "react";
import "./Hierarchy.css";
import { useAuth } from "../../../context/AuthContext";

// 🔁 Import all form components
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

  const toggleNode = (parent, index) => {
    const key = `${parent}-${index}`;
    setExpandedNodes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleNodeClick = (label, type) => {
    setSelectedNode({ label, type });
  };

  const inferTypeFromLabel = (label) => {
    const lower = label.toLowerCase();
    if (lower.includes("main site")) return "main-site";
    if (lower.includes("subsite")) return "subsite";
    if (lower.includes("room segment")) return "room-segment";
    if (lower.includes("floor area")) return "floor-area";
    if (lower.includes("floor")) return "floor";
    if (lower.includes("room")) return "room";
    if (lower.includes("poe")) return "poe";
    return "unknown";
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

  const renderTree = (nodes, parent = "", level = 0) => {
    return nodes.map((node, index) => {
      const key = `${parent}-${index}`;
      const label = typeof node === "string" ? node : node.name || node.site;
      const isExpanded = expandedNodes[key];
      const inferredType = inferTypeFromLabel(label);

      const shouldDisplay =
        !searchTerm || label.toLowerCase().includes(searchTerm.toLowerCase());

      if (!shouldDisplay) return null;

      return (
        <div key={key} className="tree-node" style={{ marginLeft: level * 15 }}>
          <div
            className="tree-node-label"
            onClick={() => handleNodeClick(label, inferredType)}
          >
            ▶ {label}
          </div>
          {typeof node !== "string" && node.children && isExpanded && (
            <div className="tree-children">
              {renderTree(node.children, key, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const renderFormForType = (type) => {
    switch (type) {
      case "main-site":
        return <MainSiteInfoForm />;
      case "subsite":
        return <RegisterSubSiteForm />;
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
        return <p className="no-selection">🛈 Select a node from the hierarchy to view/edit details.</p>;
    }
  };

  return (
    <div className="hierarchy-tab">
      {/* Search Bar */}
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
        {/* Tree View */}
        <div className="tree-panel">
          <h3>Hierarchy Tree</h3>
          <div className="tree-list">
            {renderTree(dummyTree.map((s, i) => ({ ...s, name: s.site })))}
          </div>
        </div>

        {/* Right Form Section */}
        <div className="form-panel">
          <div className="form-box">
            <h4>{selectedNode?.label || "Site Name"}</h4>
            {renderFormForType(selectedNode?.type)}
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
