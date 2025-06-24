// src/components/DataSetup/DataSetup.jsx
import React, { useEffect } from "react";
import DashboardHeader from "../DashboardHeader/DashboardHeader";
import "./DataSetup.css";
import { useAuth } from "../../context/AuthContext";
import { useParams, useNavigate, useLocation } from "react-router-dom";

const tabRoutes = ["overview", "hierarchy", "tables", "relationships"];

const DataSetup = () => {
  const { admin } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const currentTab = location.pathname.split("/").pop(); // gets 'overview' etc.

  useEffect(() => {
    // Redirect to overview if no valid tab is selected
    if (!tabRoutes.includes(currentTab)) {
      navigate(`/data-setup/${id}/overview`);
    }
  }, [currentTab, navigate, id]);

  return (
    <div className="page-container">
      <DashboardHeader />

      <div className="data-setup-body">
        <div className="data-setup-header">
          <h1 className="site-name">{admin?.companyName}</h1>
          <button className="create-button">+ Create</button>
        </div>

        <div className="data-setup-tabs">
          {["Overview", "Hierarchy", "Tables", "Relationships"].map((tab) => (
            <div
              key={tab}
              className={`tab-item ${currentTab === tab.toLowerCase() ? "active" : ""}`}
              onClick={() => navigate(`/data-setup/${id}/${tab.toLowerCase()}`)}
            >
              {tab}
            </div>
          ))}
        </div>

        <div className="data-setup-content">
          <p>Loading {currentTab.charAt(0).toUpperCase() + currentTab.slice(1)} Component...</p>
        </div>
      </div>
    </div>
  );
};

export default DataSetup;
