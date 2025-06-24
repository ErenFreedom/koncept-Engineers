// src/components/DataSetup/DataSetup.jsx
import React from "react";
import DashboardHeader from "../DashboardHeader/DashboardHeader";
import "./DataSetup.css";

const DataSetup = () => {
  return (
    <div className="page-container">
      <DashboardHeader />
      <div className="page-body">
        <h1 className="page-heading">Data Setup</h1>
      </div>
    </div>
  );
};

export default DataSetup;
