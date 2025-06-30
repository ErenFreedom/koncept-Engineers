import React, { useState } from "react";
import "./HierarchyTree.css";

const HierarchyTree = ({ treeData, onSelect, setDropdownNode }) => {
  const [expandedNodes, setExpandedNodes] = useState({});

  const toggleExpand = (path) => {
    setExpandedNodes((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const renderTree = (nodes, path = "", depth = 0) => {
    return nodes.map((node, idx) => {
      const currentPath = `${path}-${idx}`;
      const label = typeof node === "string" ? node : node.name || node.site;
      const nodeType = node?.type || "unknown";
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

            <div
              className="node-label"
              onClick={() => onSelect(label, nodeType, node)}
            >
              <div className="node-main-text">{label}</div>
              <div className="node-type-text">{nodeType}</div>
            </div>


            <div
              className="three-dot-menu"
              onClick={(e) => {
                e.stopPropagation();
                setDropdownNode(node); // ✅ opens dropdown for this specific node
              }}
            >
              ⋮
            </div>
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
