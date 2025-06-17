import React, { useState } from "react";
import DashboardHeader from "../../components/DashboardHeader/DashboardHeader";
import Launchpad from "../../components/Launchpad/Launchpad";

// Module pages
import DataSetup from "../../components/Launchpadmodules/DataSetup";
import Devices from "../../components/Launchpadmodules/Devices";
import Account from "../../components/Launchpadmodules/Account";
import Overview from "../../components/Launchpadmodules/Operationmanager";

import "./Dashboard.css";

const Dashboard = () => {
  const [showLaunchpad, setShowLaunchpad] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState(null);

  // Handle module selection from Launchpad
  const handleModuleSelect = (moduleId) => {
    setSelectedModuleId(moduleId);
    setShowLaunchpad(false); // close modal after selection
  };

  // Dynamically render selected module
  const renderSelectedModule = () => {
    switch (selectedModuleId) {
      case "data-setup":
        return <DataSetup />;
      case "devices":
        return <Devices />;
      case "account":
        return <Account />;
      case "operation-manager":
        return <Overview />;
      default:
        return (
          <main className="dashboard-main">
            <h1>Welcome to Koncept Engineers</h1>
            <p>Choose a module from the Launchpad to get started.</p>
          </main>
        );
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* Header with Launchpad trigger */}
     <DashboardHeader 
  onLaunchpadClick={() => setShowLaunchpad(true)} 
  onSelect={handleModuleSelect}  
/>

    
      {renderSelectedModule()}

      {/* Launchpad modal */}
      {showLaunchpad && (
        <Launchpad onClose={() => setShowLaunchpad(false)} onSelect={handleModuleSelect} />
      )}
    </div>
  );
};

export default Dashboard;





