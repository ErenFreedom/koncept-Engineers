import axios from "axios";
import { toast } from "react-toastify";

export const SET_FR_LOADING = "SET_FR_LOADING";
export const SET_FR_SUCCESS = "SET_FR_SUCCESS";
export const SET_FR_ERROR = "SET_FR_ERROR";
export const SET_FR_DATA = "SET_FR_DATA";

export const setFRLoading = (val) => ({ type: SET_FR_LOADING, payload: val });
export const setFRSuccess = () => ({ type: SET_FR_SUCCESS, payload: true });
export const setFRError = (msg) => ({ type: SET_FR_ERROR, payload: msg });
export const setFRData = (key, data) => ({ type: SET_FR_DATA, payload: { key, data } });

const API = process.env.REACT_APP_API_BASE_URL;

const handleError = (dispatch, err, label) => {
  const msg = err?.response?.data?.message || err.message;
  toast.error(`${label} failed: ${msg}`);
  dispatch(setFRError(msg));
};

export const fetchFloorRoomEntity = (endpoint, entityKey, token, params = {}) => async (dispatch) => {
  dispatch(setFRLoading(true));
  try {
    const fullEndpoint = endpoint.startsWith("/api") ? endpoint : `/api${endpoint}`;

    const { data } = await axios.get(`${API}${fullEndpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    dispatch(setFRData(entityKey, data));
    dispatch(setFRSuccess());
  } catch (err) {
    handleError(dispatch, err, `Fetch ${entityKey}`);
  } finally {
    dispatch(setFRLoading(false));
  }
};
