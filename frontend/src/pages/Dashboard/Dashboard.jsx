import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import EngineeringDashboard from "./EngineeringDashboard";
import OperationalDashboard from "./OperationalDashboard";
import ModeSwitcher from "../../components/Modeswitcher/Modeswitcher";

// Contexts
import { useAuth } from "../../context/AuthContext";
import { useMode } from "../../context/ModeContext"

// Styles
import "./Dashboard.css";

const Dashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { accessToken, logout, admin: authAdmin } = useAuth();
  const { mode, MODES } = useMode();

  // Dummy admin object for local testing
  const admin = authAdmin || {
    firstName: "Dev",
    lastName: "User",
    id: "local-dev-id",
  };

  // Disabled auth check for local development
  useEffect(() => {
    // Uncomment for production use

    // if (!authAdmin || !accessToken) {
    //   toast.error("Session expired. Please log in again.");
    //   navigate("/AuthAdmin");
    //   return;
    // }

    // if (authAdmin.id.toString() !== id.toString()) {
    //   toast.error("Unauthorized access!");
    //   logout();
    //   navigate("/AuthAdmin");
    //   return;
    // }
  }, [authAdmin, accessToken, id, navigate, logout]);

  return (
    <div className="min-h-screen bg-[#0a1b30] text-white relative">
      {/* Mode switcher toggle */}
      <ModeSwitcher />

      {/* Dashboard switch based on current mode */}
      {mode === MODES.ENGINEERING ? (
        <EngineeringDashboard admin={admin} />
      ) : mode === MODES.OPERATIONAL ? (
        <OperationalDashboard admin={admin} />
      ) : (
        <div className="text-center mt-10 text-red-400">
          Unknown dashboard mode selected.
        </div>
      )}
    </div>
  );
};

export default Dashboard;


