import axios from "axios";
import { toast } from "react-toastify";

export const SUBSITE_SET_LOADING = "SUBSITE_SET_LOADING";
export const SUBSITE_SET_ERROR = "SUBSITE_SET_ERROR";
export const SUBSITE_SET_SUCCESS = "SUBSITE_SET_SUCCESS";

export const setSubsiteLoading = (val) => ({
  type: SUBSITE_SET_LOADING,
  payload: val,
});

export const setSubsiteError = (msg) => ({
  type: SUBSITE_SET_ERROR,
  payload: msg,
});

export const setSubsiteSuccess = () => ({
  type: SUBSITE_SET_SUCCESS,
  payload: true,
});

const API_BASE = process.env.REACT_APP_API_BASE_URL + "/api/subsite-structure";

const handleError = (dispatch, err, label) => {
  const msg = err?.response?.data?.message || err.message;
  toast.error(`${label} failed: ${msg}`);
  dispatch(setSubsiteError(msg));
};

export const addSubsiteEntity = (endpoint, payload, token) => async (dispatch) => {
  dispatch(setSubsiteLoading(true));
  try {
    const { data } = await axios.post(`${API_BASE}/${endpoint}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success(`✅ ${endpoint} added`);
    dispatch(setSubsiteSuccess());
  } catch (err) {
    handleError(dispatch, err, `Add ${endpoint}`);
  } finally {
    dispatch(setSubsiteLoading(false));
  }
};

export const editSubsiteEntity = (endpoint, payload, token) => async (dispatch) => {
  dispatch(setSubsiteLoading(true));
  try {
    const { data } = await axios.put(`${API_BASE}/${endpoint}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success(`📝 ${endpoint} updated`);
    dispatch(setSubsiteSuccess());
  } catch (err) {
    handleError(dispatch, err, `Edit ${endpoint}`);
  } finally {
    dispatch(setSubsiteLoading(false));
  }
};

export const deleteSubsiteEntity = (endpoint, { id, subsite_id }, token) => async (dispatch) => {
  dispatch(setSubsiteLoading(true));
  try {
    let payloadKey;
    switch (endpoint.replace("/delete", "")) {
      case "floor": payloadKey = "floor_id"; break;
      case "room": payloadKey = "room_id"; break;
      case "floor-area": payloadKey = "floor_area_id"; break;
      case "room-segment": payloadKey = "room_segment_id"; break;
      case "poe": payloadKey = "poe_id"; break;
      default: payloadKey = "id";
    }

    await axios.delete(`${API_BASE}/${endpoint}`, {
      data: { [payloadKey]: id, subsite_id },  // ✅ both required
      headers: { Authorization: `Bearer ${token}` },
    });

    toast.success(`🗑️ ${endpoint.replace("/delete", "")} deleted`);
    dispatch(setSubsiteSuccess());
  } catch (err) {
    handleError(dispatch, err, `Delete ${endpoint.replace("/delete", "")}`);
  } finally {
    dispatch(setSubsiteLoading(false));
  }
};

export const assignSensorToPoE = (payload, token) => async (dispatch) => {
  dispatch(setSubsiteLoading(true));
  try {
    const { data } = await axios.post(`${API_BASE}/sensor/assign-room`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success("✅ Sensor assigned");
    dispatch(setSubsiteSuccess());
  } catch (err) {
    handleError(dispatch, err, "Assign Sensor");
  } finally {
    dispatch(setSubsiteLoading(false));
  }
};

export const unassignSensorFromPoE = (payload, token) => async (dispatch) => {
  dispatch(setSubsiteLoading(true));
  try {
    const { data } = await axios.post(`${API_BASE}/sensor/unassign-room`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success("❎ Sensor unassigned");
    dispatch(setSubsiteSuccess());
  } catch (err) {
    handleError(dispatch, err, "Unassign Sensor");
  } finally {
    dispatch(setSubsiteLoading(false));
  }
};
