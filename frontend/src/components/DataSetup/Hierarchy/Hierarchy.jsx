// Hierarchy.jsx (updated with full-page layout, toggle tree, stacked forms)
import React, { useState } from "react";
import "./Hierarchy.css";
import { useAuth } from "../../../context/AuthContext";

const Hierarchy = () => {
  const { admin } = useAuth();
  const [expandedNodes, setExpandedNodes] = useState({});

  const toggleNode = (site, level) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [site + level]: !prev[site + level],
    }));
  };

  const dummyTree = [
    {
      site: `Main Site - ${admin?.companyName || "Company"}`,
      level: 0,
      children: [
        {
          name: "Building A",
          children: [
            {
              name: "Floor 1",
              children: [
                {
                  name: "Room X",
                  children: ["PoE 1", "PoE 2"],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      site: "Subsite - Block 1",
      level: 0,
      children: [
        {
          name: "Block1 Building A",
          children: [],
        },
      ],
    },
  ];

  const renderTree = (nodes, parent = "", level = 0) => {
    return nodes.map((node, index) => {
      const key = `${parent}-${index}`;
      const isExpanded = expandedNodes[key];
      return (
        <div key={key} className="tree-node" style={{ marginLeft: level * 15 }}>
          <div
            className="tree-node-label"
            onClick={() => toggleNode(parent, index)}
          >
            ▶ {typeof node === "string" ? node : node.name || node.site}
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

  return (
    <div className="hierarchy-tab">
      <div className="hierarchy-container">
        {/* Tree View */}
        <div className="tree-panel">
          <h3>Hierarchy Tree</h3>
          <div className="tree-list">
            {renderTree(dummyTree.map((s, i) => ({ ...s, name: s.site })))}
          </div>
        </div>

        {/* Form Section */}
        <div className="form-panel">
          <div className="form-box">
            <h4>Site Name</h4>
            <p>Site Name Form Placeholder</p>
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
