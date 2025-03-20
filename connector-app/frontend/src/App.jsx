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
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/otp-verification" element={<AdminAuthOtp />} /> {/* ✅ Added OTP Route */}
            </Routes>
        </Router>
    );
};

export default App;
