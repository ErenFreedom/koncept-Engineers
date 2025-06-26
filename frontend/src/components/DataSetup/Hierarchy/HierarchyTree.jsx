// HierarchyTree.jsx
import React, { useState } from "react";
import "./HierarchyTree.css";

const HierarchyTree = ({ treeData, onSelect }) => {
  const [expandedNodes, setExpandedNodes] = useState({});

  const toggleExpand = (path) => {
    setExpandedNodes((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const getAllowedActions = (type) => {
    switch (type) {
      case "site":
        return ["Add Floor", "Add PoE"];
      case "floor":
        return ["Add Room", "Add Floor Area", "Add PoE"];
      case "room":
        return ["Add Room Segment", "Add PoE"];
      case "floor-area":
      case "room-segment":
        return ["Add PoE"];
      case "poe":
        return ["Add Data Point"];
      default:
        return [];
    }
  };

  const inferNodeType = (label) => {
    const l = label.toLowerCase();
    if (l.includes("site")) return "site";
    if (l.includes("floor area")) return "floor-area";
    if (l.includes("room segment")) return "room-segment";
    if (l.includes("room")) return "room";
    if (l.includes("floor")) return "floor";
    if (l.includes("poe")) return "poe";
    return "unknown";
  };

  const renderTree = (nodes, path = "", depth = 0) => {
    return nodes.map((node, idx) => {
      const currentPath = `${path}-${idx}`;
      const label = typeof node === "string" ? node : node.name || node.site;
      const nodeType = node?.type || "unknown"; // ✅ use actual type
      const isExpanded = expandedNodes[currentPath];

      return (
        <div
          key={currentPath}
          className="tree-node"
          style={{ marginLeft: depth * 15 }}
        >
          <div className="tree-node-header">
            {typeof node !== "string" && node.children ? (
              <span onClick={() => toggleExpand(currentPath)} className="toggle-arrow">
                {isExpanded ? "▼" : "▶"}
              </span>
            ) : (
              <span className="leaf-dot">•</span>
            )}

            <span className="node-label" onClick={() => onSelect(label, nodeType)}>
              {label}
            </span>

            {/* optional + button, if you want to keep it */}
            {/* <div className="actions">
            <button className="add-btn">+</button>
          </div> */}
          </div>

          {isExpanded && node.children && (
            <div className="tree-children">
              {renderTree(node.children, currentPath, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };


  return <div className="hierarchy-tree-container">{renderTree(treeData)}</div>;
};

export default HierarchyTree;
