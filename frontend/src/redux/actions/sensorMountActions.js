import axios from "axios";
import { toast } from "react-toastify";

export const SENSOR_MOUNT_REQUEST = "SENSOR_MOUNT_REQUEST";
export const SENSOR_MOUNT_SUCCESS = "SENSOR_MOUNT_SUCCESS";
export const SENSOR_MOUNT_FAIL = "SENSOR_MOUNT_FAIL";

const API = process.env.REACT_APP_API_BASE_URL;

const handleError = (dispatch, err, label) => {
  const msg = err?.response?.data?.message || err.message;
  toast.error(`${label} failed: ${msg}`);
  dispatch({ type: SENSOR_MOUNT_FAIL, payload: msg });
};

export const assignSensorToPoe = (sensorId, poeId, token, isSubsite = false, subsiteId = null) => async (dispatch) => {
  dispatch({ type: SENSOR_MOUNT_REQUEST });
  try {
    const payload = isSubsite
      ? { sensor_id: sensorId, poe_id: poeId, subsiteId }
      : { sensor_id: sensorId, poe_id: poeId };

    const url = isSubsite ? `${API}/subsite-structure/sensor/assign-room` : `${API}/sensor/assign-room`;

    await axios.post(url, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    toast.success(`✅ Sensor assigned to PoE`);
    dispatch({ type: SENSOR_MOUNT_SUCCESS });
  } catch (err) {
    handleError(dispatch, err, "Assign Sensor");
  }
};

export const unassignSensorFromPoe = (sensorId, token, isSubsite = false, subsiteId = null) => async (dispatch) => {
  dispatch({ type: SENSOR_MOUNT_REQUEST });
  try {
    const payload = isSubsite
      ? { sensor_id: sensorId, subsiteId }
      : { sensor_id: sensorId };

    const url = isSubsite ? `${API}/subsite-structure/sensor/unassign-room` : `${API}/sensor/unassign-room`;

    await axios.post(url, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    toast.success(`❎ Sensor unassigned from PoE`);
    dispatch({ type: SENSOR_MOUNT_SUCCESS });
  } catch (err) {
    handleError(dispatch, err, "Unassign Sensor");
  }
};

export const getPoePath = (poeId, token, isSubsite = false, subsiteId = null) => async (dispatch) => {
  dispatch({ type: SENSOR_MOUNT_REQUEST });
  try {
    const params = isSubsite
      ? { poe_id: poeId, subsiteId }
      : { poe_id: poeId };

    const endpoint = isSubsite
      ? `/api/subsite-structure/poe/subsite/path`
      : `/api/poe/path`;

    const { data } = await axios.get(`${API}${endpoint}`, {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });

    dispatch({ type: SENSOR_MOUNT_SUCCESS, payload: data });
  } catch (err) {
    handleError(dispatch, err, "Get PoE Path");
  }
};

export const fetchActiveSensors = (token, isSubsite = false, subsiteId = null) => async (dispatch) => {
  dispatch({ type: SENSOR_MOUNT_REQUEST });
  try {
    const params = isSubsite && subsiteId ? { subsite_id: subsiteId } : {};
    const endpoint = isSubsite
      ? `/api/sensors/subsite/active-sensors`
      : `/api/sensors/active-sensors`; 
    const { data } = await axios.get(`${API}${endpoint}`, {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });

    dispatch({ type: SENSOR_MOUNT_SUCCESS, payload: { activeSensors: data.sensors } });
  } catch (err) {
    handleError(dispatch, err, "Fetch Active Sensors");
  }
};
