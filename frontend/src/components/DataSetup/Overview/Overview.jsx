import React, { useState } from "react";
import "./Overview.css";
import { useAuth } from "../../../context/AuthContext";

const Overview = () => {
  const { admin } = useAuth();
  const [showPartition, setShowPartition] = useState(true);
  const [showSites, setShowSites] = useState(true);

  const companyName = admin?.companyName || "Main Site";
  const subSites = admin?.subSites || [];
  const allSites = [{ id: 0, name: `Main Site - ${companyName}` }, ...subSites.map((s, i) => ({
    id: s.subSiteId,
    name: `Subsite - ${s.subSiteName || `Block ${i + 1}`}`
  }))];

  const [selectedSite, setSelectedSite] = useState(allSites[0].name);

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
              <label htmlFor="partition-select">Partition *</label>
              <select
                id="partition-select"
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
              >
                {allSites.map((site) => (
                  <option key={site.id} value={site.name}>
                    {site.name}
                  </option>
                ))}
              </select>
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
            {allSites.map((site) => (
              <div key={site.id} className="site-card">
                <h4>{site.name}</h4>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Statistics */}
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
