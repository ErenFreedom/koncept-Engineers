import React, { useState } from "react";
import "./Hierarchy.css";
import { useAuth } from "../../../context/AuthContext";

const Hierarchy = () => {
  const { admin } = useAuth();
  const [activeFormTab, setActiveFormTab] = useState("Site Name");

  const dummyTree = [
    {
      site: `Main Site - ${admin?.companyName || "Company"}`,
      children: ["Building A", "Building B"],
    },
    {
      site: "Subsite - Block 1",
      children: ["Block1 Building A", "Block1 Building B"],
    },
    {
      site: "Subsite - Block 2",
      children: ["Block2 Building X", "Block2 Floor Y"],
    },
  ];

  return (
    <div className="hierarchy-tab">
      <div className="hierarchy-container">
        {/* Left: Tree Panel */}
        <div className="tree-panel">
          <h3>Hierarchy Tree</h3>
          <ul className="tree-list">
            {dummyTree.map((site, idx) => (
              <li key={idx}>
                <strong>{site.site}</strong>
                <ul>
                  {site.children.map((child, i) => (
                    <li key={i}>{child}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Form Panel */}
        <div className="form-panel">
          <div className="form-tabs">
            {["Site Name", "Relationships", "Tags"].map((tab) => (
              <div
                key={tab}
                className={`form-tab ${activeFormTab === tab ? "active" : ""}`}
                onClick={() => setActiveFormTab(tab)}
              >
                {tab}
              </div>
            ))}
          </div>

          <div className="form-content">
            {activeFormTab === "Site Name" && (
              <div className="form-box">Site Name Form Placeholder</div>
            )}
            {activeFormTab === "Relationships" && (
              <div className="form-box">Relationships Form Placeholder</div>
            )}
            {activeFormTab === "Tags" && (
              <div className="form-box">Tags Form Placeholder</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hierarchy;
