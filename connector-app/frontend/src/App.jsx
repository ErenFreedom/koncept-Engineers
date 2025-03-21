import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import Login from "./pages/Login/Login";
import Desigo from "./pages/Desigo/Desigo";
import Dashboard from "./pages/Dashboard/Dashboard";
import AdminAuthOtp from "./pages/OTP/AdminAuthOtp"; // ✅ Import OTP Page

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/desigo-auth" element={<Desigo />} />
                <Route path="/dashboard/:id" element={<Dashboard />} /> {/* ✅ Dashboard with Admin ID */}
                <Route path="/otp-verification" element={<AdminAuthOtp />} /> {/* ✅ OTP Verification Route */}
            </Routes>
        </Router>
    );
};

export default App;
