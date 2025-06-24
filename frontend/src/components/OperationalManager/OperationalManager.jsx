// src/components/OperationalManager/OperationalManager.jsx
import React from "react";
import DashboardHeader from "../DashboardHeader/DashboardHeader";
import "./OperationalManager.css";

const OperationalManager = () => {
  return (
    <div className="page-container">
      <DashboardHeader />
      <div className="page-body">
        <h1 className="page-heading">Operational Manager</h1>
      </div>
    </div>
  );
};

export default OperationalManager;
