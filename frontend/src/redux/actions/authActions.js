import axios from "axios";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

// ✅ Action Types
export const ADMIN_LOGIN_REQUEST = "ADMIN_LOGIN_REQUEST";
export const ADMIN_LOGIN_OTP_SENT = "ADMIN_LOGIN_OTP_SENT";
export const ADMIN_LOGIN_VERIFY_OTP_REQUEST = "ADMIN_LOGIN_VERIFY_OTP_REQUEST";
export const ADMIN_LOGIN_SUCCESS = "ADMIN_LOGIN_SUCCESS";
export const ADMIN_LOGIN_FAIL = "ADMIN_LOGIN_FAIL";
export const ADMIN_LOGOUT = "ADMIN_LOGOUT";

// ✅ Send OTP for Login
export const sendAdminOtp = (identifier) => async (dispatch) => {
  try {
    dispatch({ type: ADMIN_LOGIN_REQUEST });

    await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/admin/send-otp`, { identifier });

    dispatch({ type: ADMIN_LOGIN_OTP_SENT });
    toast.success(`OTP sent to ${identifier}`);
  } catch (error) {
    dispatch({ type: ADMIN_LOGIN_FAIL, payload: error.response?.data?.message || "OTP sending failed" });
    toast.error(error.response?.data?.message || "OTP sending failed");
  }
};

// ✅ Verify OTP and Authenticate Admin
export const verifyAdminOtp = (identifier, otp) => async (dispatch) => {
  try {
    dispatch({ type: ADMIN_LOGIN_VERIFY_OTP_REQUEST });

    const { data } = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/admin/verify-otp`, { identifier, otp });

    dispatch({ type: ADMIN_LOGIN_SUCCESS, payload: data });

    // ✅ Store token in local storage
    localStorage.setItem("adminToken", JSON.stringify(data.accessToken));

    // ✅ Decode JWT to extract adminId and redirect to Dashboard
    const decodedToken = jwtDecode(data.accessToken);
    const adminId = decodedToken.adminId;

    toast.success("Login Successful!");
    window.location.href = `/Dashboard/${adminId}`; // ✅ Redirecting
  } catch (error) {
    dispatch({ type: ADMIN_LOGIN_FAIL, payload: error.response?.data?.message || "OTP verification failed" });
    toast.error(error.response?.data?.message || "OTP verification failed");
  }
};

// ✅ Admin Logout Action
export const logoutAdmin = () => (dispatch) => {
  localStorage.removeItem("adminToken");
  dispatch({ type: ADMIN_LOGOUT });
  toast.success("Logged out successfully");
};
