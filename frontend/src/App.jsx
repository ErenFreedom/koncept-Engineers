import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HomePage from "./pages/HomePage/HomePage";
import BreakPoint from "./pages/Registration/BreakPoint";
import Admin from "./pages/Registration/Admin";
import Staff from "./pages/Registration/Staff";
import AuthBreakPoint from "./pages/Auth/AuthBreakPoint";
import AuthAdmin from "./pages/Auth/AdminAuth";
import AuthStaff from "./pages/Auth/StaffAuth";
import AdminOtp from "./pages/OTP/AdminOTP";
import StaffOtp from "./pages/OTP/StaffOTP";
import Dashboard from "./pages/Dashboard/Dashboard";
import { FormDataProvider } from "./context/FormDataContext"; // ✅ Import FormData Context Provider

const App = () => {
  return (
    <FormDataProvider> {/* ✅ Wrap the entire app inside FormDataProvider */}
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/SignUp" element={<BreakPoint />} />
          <Route path="/Admin" element={<Admin />} />
          <Route path="/Staff" element={<Staff />} />
          <Route path="/Auth" element={<AuthBreakPoint />} />
          <Route path="/AuthAdmin" element={<AuthAdmin />} />
          <Route path="/AuthStaff" element={<AuthStaff />} />
          <Route path="/AdminOtp" element={<AdminOtp />} />
          <Route path="/StaffOtp" element={<StaffOtp />} />
          <Route path="/Dashboard/:id" element={<Dashboard />} />
        </Routes>
      </Router>
    </FormDataProvider>
  );
};

export default App;
