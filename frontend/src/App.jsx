import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./redux/store"; // Import Redux Store & Persistor
import HomePage from "./pages/HomePage/HomePage";
import BreakPoint from "./pages/Registration/BreakPoint";
import Admin from "./pages/Registration/Admin";
import Staff from "./pages/Registration/Staff";
import AuthBreakPoint from "./pages/Auth/AuthBreakPoint";
import AuthAdmin from "./pages/Auth/AdminAuth";
import AuthStaff from "./pages/Auth/StaffAuth";
import AdminOtp from "./pages/OTP/AdminOTP";
import StaffOtp from "./pages/OTP/StaffOTP";
import AdminAuthOtp from "./pages/OTP/AdminAuthOtp";
import Dashboard from "./pages/Dashboard/Dashboard";
import ViewProfile from "./components/ToViewInfo/ViewProfile";
import EditProfile from "./components/EditProfileModal/EditProfile";

import { FormDataProvider } from "./context/FormDataContext"; // ✅ Import FormData Context Provider

const App = () => {
  return (
    <Provider store={store}> {/* ✅ Wrap App with Redux Store */}
      <PersistGate loading={null} persistor={persistor}> {/* ✅ Persist Redux State */}
        <FormDataProvider> {/* ✅ Wrap entire app inside FormDataProvider */}
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
              <Route path="/AdminAuthOtp" element={<AdminAuthOtp />} />
              <Route path="/Dashboard/:id" element={<Dashboard />} />
              <Route path="/admin/view-profile" element={<ViewProfile />} />
              <Route path="/admin/edit-profile/:id" element={<EditProfile />} />

            </Routes>
          </Router>
        </FormDataProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
