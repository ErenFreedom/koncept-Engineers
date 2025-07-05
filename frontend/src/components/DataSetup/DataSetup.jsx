import React, { useEffect } from "react";
import { useParams, useNavigate, useLocation, Outlet } from "react-router-dom";
import DashboardHeader from "../DashboardHeader/DashboardHeader";
import "./DataSetup.css";
import { useAuth } from "../../context/AuthContext";

const tabRoutes = ["overview", "hierarchy", "tables", "data-mount-point"];

const DataSetup = () => {
  const { admin } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const currentTab = location.pathname.split("/").pop(); 

  useEffect(() => {
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
          {tabRoutes.map((tab) => (
            <div
              key={tab}
              className={`tab-item ${currentTab === tab ? "active" : ""}`}
              onClick={() => navigate(`/data-setup/${id}/${tab}`)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </div>
          ))}
        </div>

        <div className="data-setup-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DataSetup;
