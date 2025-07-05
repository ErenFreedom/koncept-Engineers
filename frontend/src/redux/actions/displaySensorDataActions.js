import axios from "axios";
import { toast } from "react-toastify";

export const SENSOR_DATA_REQUEST = "SENSOR_DATA_REQUEST";
export const SENSOR_DATA_SUCCESS = "SENSOR_DATA_SUCCESS";
export const SENSOR_DATA_FAIL = "SENSOR_DATA_FAIL";

const API = process.env.REACT_APP_API_BASE_URL + "/api";

export const fetchMainSiteSensorData = (token) => async (dispatch) => {
  try {
    dispatch({ type: SENSOR_DATA_REQUEST });
    const { data } = await axios.get(`${API}/sensor-data/active`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    dispatch({ type: SENSOR_DATA_SUCCESS, payload: data.sensors });
  } catch (err) {
    toast.error(`❌ Fetch main site sensor data failed: ${err.response?.data?.message || err.message}`);
    dispatch({
      type: SENSOR_DATA_FAIL,
      payload: err.response?.data?.message || err.message,
    });
  }
};

export const fetchSubSiteSensorData = (subsiteId, token) => async (dispatch) => {
  try {
    dispatch({ type: SENSOR_DATA_REQUEST });
    const { data } = await axios.get(`${API}/sensor-data/subsite/active?subsite_id=${subsiteId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    dispatch({ type: SENSOR_DATA_SUCCESS, payload: data.sensors });
  } catch (err) {
    toast.error(`❌ Fetch sub-site sensor data failed: ${err.response?.data?.message || err.message}`);
    dispatch({
      type: SENSOR_DATA_FAIL,
      payload: err.response?.data?.message || err.message,
    });
  }
};
