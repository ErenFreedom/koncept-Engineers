import {
  ADMIN_LOGIN_REQUEST,
  ADMIN_LOGIN_OTP_SENT,
  ADMIN_LOGIN_VERIFY_OTP_REQUEST,
  ADMIN_LOGIN_SUCCESS,
  ADMIN_LOGIN_FAIL,
  ADMIN_LOGOUT,
} from "../actions/authActions";

// ✅ Initial State
const initialState = {
  admin: null,
  loading: false,
  otpSent: false,
  error: null,
};

// ✅ Auth Reducer
export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADMIN_LOGIN_REQUEST:
      return { ...state, loading: true, error: null };

    case ADMIN_LOGIN_OTP_SENT:
      return { ...state, loading: false, otpSent: true };

    case ADMIN_LOGIN_VERIFY_OTP_REQUEST:
      return { ...state, loading: true };

    case ADMIN_LOGIN_SUCCESS:
      return { ...state, loading: false, admin: action.payload, otpSent: false, error: null };

    case ADMIN_LOGIN_FAIL:
      return { ...state, loading: false, error: action.payload, otpSent: false };

    case ADMIN_LOGOUT:
      return { ...state, admin: null, otpSent: false };

    default:
      return state;
  }
};
