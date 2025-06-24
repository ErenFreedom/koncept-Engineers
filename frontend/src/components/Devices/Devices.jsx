// src/components/Devices/Devices.jsx
import React from "react";
import DashboardHeader from "../DashboardHeader/DashboardHeader";
import "./Devices.css";

const Devices = () => {
  return (
    <div className="page-container">
      <DashboardHeader />
      <div className="page-body">
        <h1 className="page-heading">Devices</h1>
      </div>
    </div>
  );
};

export default Devices;
