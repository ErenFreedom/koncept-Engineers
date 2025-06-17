import React from "react";
import DashboardHeader from "../../components/DashboardHeader/DashboardHeader";

const OperationalDashboard = ({ admin }) => {
  return (
    <div className="dashboard-container">
      <DashboardHeader />
    
    <div className="p-6">
      <h1 className="text-3xl font-semibold text-white mb-2">
        Operational Dashboard
      </h1>
      <p className="text-gray-300">
        Welcome, {admin?.firstName} {admin?.lastName}! 👋
      </p>

      <div className="mt-8 bg-[#112d4e] p-6 rounded-2xl shadow-lg border border-[#1e3a5f]">
        <p className="text-gray-200 text-lg">
          This is a placeholder for Operational KPIs and controls.
        </p>
      </div>
    </div>
    </div>
  );
};

export default OperationalDashboard;
