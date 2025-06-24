// src/components/Accounts/Accounts.jsx
import React from "react";
import DashboardHeader from "../DashboardHeader/DashboardHeader";
import "./Accounts.css";

const Accounts = () => {
  return (
    <div className="page-container">
      <DashboardHeader />
      <div className="page-body">
        <h1 className="page-heading">Accounts</h1>
      </div>
    </div>
  );
};

export default Accounts;
