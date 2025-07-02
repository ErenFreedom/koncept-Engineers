import React from "react";
import { FaChevronRight, FaChevronDown, FaEdit, FaTrash } from "react-icons/fa";
import "./HierarchyTree.css";

const HierarchyTree = ({ treeData, onSelect, onEdit, onDelete, expandedNodes = {}, toggleNode }) => {
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
              <span
                onClick={() => toggleNode(path, idx)}
                className="toggle-arrow"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
              </span>
            ) : (
              <span className="leaf-dot">•</span>
            )}

            <div
              className="node-label"
              onClick={() => onSelect(label, nodeType, node)}
              title={`Select ${label}`}
            >
              <div className="node-main-text">{label}</div>
              <div className="node-type-text">
                Type: {nodeType.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </div>
            </div>

            <div className="node-actions">
              <button
                className="edit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(node);
                }}
                title="Edit"
              >
                <FaEdit size={14} />
              </button>
              {nodeType !== "main-site" && (
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(node);
                  }}
                  title="Delete"
                >
                  <FaTrash size={14} />
                </button>
              )}
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
