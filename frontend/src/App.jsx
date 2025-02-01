import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import BreakPoint from "./pages/Registration/BreakPoint"; // Import SignUp BreakPoint component
import Admin from "./pages/Registration/Admin"; // Import Admin signup component
import Staff from "./pages/Registration/Staff"; // Import Staff signup component
import AuthBreakPoint from "./pages/Auth/AuthBreakPoint"; // Import Auth BreakPoint component
import AuthAdmin from "./pages/Auth/AdminAuth"; // Import AdminAuth component
import AuthStaff from "./pages/Auth/StaffAuth"; // Import StaffAuth component
import AdminOtp from "./pages/OTP/AdminOTP"; // Import AdminOtp page
import StaffOtp from "./pages/OTP/StaffOTP"; // Import StaffOtp page
import Dashboard from "./pages/Dashboard/Dashboard"; // Import Dashboard page

const App = () => {
  return (
    <Router>
      <Routes>
        {/* HomePage Route */}
        <Route path="/" element={<HomePage />} />

        {/* Registration Routes */}
        <Route path="/SignUp" element={<BreakPoint />} />
        <Route path="/Admin" element={<Admin />} />
        <Route path="/Staff" element={<Staff />} />

        {/* Authentication Routes */}
        <Route path="/Auth" element={<AuthBreakPoint />} />
        <Route path="/AuthAdmin" element={<AuthAdmin />} />
        <Route path="/AuthStaff" element={<AuthStaff />} />

        {/* OTP Routes */}
        <Route path="/AdminOtp" element={<AdminOtp />} />
        <Route path="/StaffOtp" element={<StaffOtp />} />

        {/* Dashboard Route */}
        <Route path="/Dashboard/:id" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
