// src/components/DataSetup/Overview/Overview.jsx
import React, { useState } from "react";
import "./Overview.css";

const Overview = () => {
  const [showPartition, setShowPartition] = useState(true);
  const [showSites, setShowSites] = useState(true);
  const sites = [
    { name: "Main Site - Galgotias University" },
    { name: "Subsite - Block A" },
    { name: "Subsite - Block B" },
    { name: "Subsite - Block C" },
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
      <div className="collapsible-section">
        <div
          className="collapsible-header"
          onClick={() => setShowPartition(!showPartition)}
        >
          <h3>Partition Overview</h3>
          <span>{showPartition ? "▼" : "▶"}</span>
        </div>
        {showPartition && (
          <div className="collapsible-body">
            <div className="partition-form">
              <label>Partition *</label>
              <input type="text" value="Galgotias University" disabled />
            </div>
            <div className="user-groups-table">
              <div className="table-header">
                <span>Name</span>
                <span>Description</span>
                <span>Role</span>
              </div>
              <div className="table-row">
                <span>DV Standard</span>
                <span>-</span>
                <span>DV Standard</span>
              </div>
              <div className="table-row">
                <span>DesigoCC Semantic Enrichment Manager</span>
                <span>-</span>
                <span>DesigoCC Semantic Enrichment Manager</span>
              </div>
              <div className="table-row">
                <span>Storage Standard</span>
                <span>-</span>
                <span>Storage Standard</span>
              </div>
              <div className="table-row">
                <span>Storage Advanced</span>
                <span>-</span>
                <span>Storage Advanced</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="collapsible-section">
        <div
          className="collapsible-header"
          onClick={() => setShowSites(!showSites)}
        >
          <h3>Sites Overview</h3>
          <span>{showSites ? "▼" : "▶"}</span>
        </div>
        {showSites && (
          <div className="collapsible-body site-stack">
            {sites.map((site, index) => (
              <div key={index} className="site-card">
                {site.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="statistics-section">
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
