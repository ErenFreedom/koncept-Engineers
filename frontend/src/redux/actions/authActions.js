import axios from "axios";
import { toast } from "react-toastify";

// ✅ Action Types
export const ADMIN_LOGIN_REQUEST = "ADMIN_LOGIN_REQUEST";
export const ADMIN_LOGIN_SUCCESS = "ADMIN_LOGIN_SUCCESS";
export const ADMIN_LOGIN_FAIL = "ADMIN_LOGIN_FAIL";
export const ADMIN_LOGOUT = "ADMIN_LOGOUT";

// ✅ Admin Login Action
export const loginAdmin = (email, password) => async (dispatch) => {
  try {
    dispatch({ type: ADMIN_LOGIN_REQUEST });

    const { data } = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/admin/login`, { email, password });

    dispatch({ type: ADMIN_LOGIN_SUCCESS, payload: data });

    // ✅ Store token in local storage
    localStorage.setItem("adminToken", JSON.stringify(data.accessToken));

    toast.success("Login Successful!");
  } catch (error) {
    dispatch({ type: ADMIN_LOGIN_FAIL, payload: error.response?.data?.message || "Login failed" });
    toast.error(error.response?.data?.message || "Login failed");
  }
};

// ✅ Admin Logout Action
export const logoutAdmin = () => (dispatch) => {
  localStorage.removeItem("adminToken");
  dispatch({ type: ADMIN_LOGOUT });
  toast.success("Logged out successfully");
};
