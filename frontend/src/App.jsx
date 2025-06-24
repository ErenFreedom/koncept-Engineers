import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./redux/store";

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
import OperationalManager from "./components/OperationalManager/OperationalManager";
import Accounts from "./components/Accounts/Accounts";
import Devices from "./components/Devices/Devices";
import DataSetup from "./components/DataSetup/DataSetup";
import Overview from "./components/DataSetup/Overview/Overview";
import Hierarchy from "./components/DataSetup/Hierarchy/Hierarchy";
import Tables from "./components/DataSetup/Tables/Tables";
import Relationships from "./components/DataSetup/Relationships/Relationships";

import { FormDataProvider } from "./context/FormDataContext";
import { AuthProvider } from "./context/AuthContext";

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <FormDataProvider>
          <AuthProvider>
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
                <Route path="/operational-manager/:id" element={<OperationalManager />} />
                <Route path="/accounts/:id" element={<Accounts />} />
                <Route path="/devices/:id" element={<Devices />} />

                <Route path="/data-setup/:id" element={<DataSetup />}>
                  <Route path="overview" element={<Overview />} />
                  <Route path="hierarchy" element={<Hierarchy />} />
                  <Route path="tables" element={<Tables />} />
                  <Route path="relationships" element={<Relationships />} />
                </Route>
              </Routes>
            </Router>
          </AuthProvider>
        </FormDataProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
