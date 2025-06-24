// src/components/DataSetup/Overview/Overview.jsx
import React, { useState } from "react";
import "./Overview.css";
import { useAuth } from "../../../context/AuthContext";

const Overview = () => {
  const { admin } = useAuth();
  const [showPartition, setShowPartition] = useState(true);
  const [showSites, setShowSites] = useState(true);

  const companyName = admin?.companyName || "Main Site";
  const subSites = admin?.subSites || []; // assuming subSites is an array of names

  const allSites = [
    { name: `Main Site - ${companyName}` },
    ...subSites.map((sub, i) => ({ name: `Subsite - ${sub.name || `Block ${i + 1}`}` })),
  ];

  const statistics = [
    { label: "Buildings", value: 1 },
    { label: "Floors", value: 4 },
    { label: "Rooms", value: 15 },
    { label: "Floor Areas", value: 7 },
    { label: "Room Segments", value: 12 },
    { label: "Pieces of Equipment", value: 18 },
  ];

  return (
    <div className="overview-tab">
      {/* Partition Overview */}
      <div className="section">
        <div className="section-header" onClick={() => setShowPartition(!showPartition)}>
          <h3>Partition Overview</h3>
          <div className="toggle-icon">{showPartition ? "▼" : "▶"}</div>
        </div>
        {showPartition && (
          <div className="section-content">
            <div className="partition-form">
              <label>Partition *</label>
              <input type="text" value={companyName} disabled />
            </div>
          </div>
        )}
      </div>

      {/* Sites Overview */}
      <div className="section">
        <div className="section-header" onClick={() => setShowSites(!showSites)}>
          <h3>Sites Overview</h3>
          <div className="toggle-icon">{showSites ? "▼" : "▶"}</div>
        </div>
        {showSites && (
          <div className="section-content site-stack">
            {allSites.map((site, index) => (
              <div key={index} className="site-card">
                <h4>{site.name}</h4>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Statistics Section */}
      <div className="stats-grid">
        {statistics.map((stat, index) => (
          <div key={index} className="stat-box">
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Overview;
