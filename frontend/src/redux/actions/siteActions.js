import axios from "axios";
import { toast } from "react-toastify";

export const setLoading = (val) => ({
  type: "SITE_SET_LOADING",
  payload: val,
});

export const setError = (msg) => ({
  type: "SITE_SET_ERROR",
  payload: msg,
});

export const setSuccess = () => ({
  type: "SITE_SET_SUCCESS",
  payload: true,
});

const API = process.env.REACT_APP_API_BASE_URL;

const handleError = (dispatch, err, action) => {
  const msg = err?.response?.data?.message || err.message;
  toast.error(`${action} failed: ${msg}`);
  dispatch(setError(msg));
};

const ENTITY_CONFIG = {
  floor: "Floor",
  room: "Room",
  "floor-area": "Floor Area",
  "room-segment": "Room Segment",
  poe: "Piece of Equipment",
};

export const addEntity = (entity, payload, token) => async (dispatch) => {
  const label = ENTITY_CONFIG[entity] || entity;
  dispatch(setLoading(true));
  try {
    await axios.post(`${API}/api/${entity}/add`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success(`✅ ${label} added`);
    dispatch(setSuccess());
  } catch (err) {
    handleError(dispatch, err, `Add ${label}`);
  } finally {
    dispatch(setLoading(false));
  }
};

export const editEntity = (entity, payload, token) => async (dispatch) => {
  const label = ENTITY_CONFIG[entity] || entity;
  dispatch(setLoading(true));
  try {
    await axios.put(`${API}/api/${entity}/edit`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success(`📝 ${label} updated`);
    dispatch(setSuccess());
  } catch (err) {
    handleError(dispatch, err, `Edit ${label}`);
  } finally {
    dispatch(setLoading(false));
  }
};

export const deleteEntity = (entity, id, token) => async (dispatch) => {
  const label = ENTITY_CONFIG[entity] || entity;
  dispatch(setLoading(true));
  try {
    let payloadKey;
    switch (entity) {
      case "floor": payloadKey = "floor_id"; break;
      case "room": payloadKey = "room_id"; break;
      case "floor-area": payloadKey = "floor_area_id"; break;
      case "room-segment": payloadKey = "room_segment_id"; break;
      case "poe": payloadKey = "poe_id"; break;
      default: payloadKey = "id";  
    }

    await axios.delete(`${API}/api/${entity}/delete`, {
      data: { [payloadKey]: id },  
      headers: { Authorization: `Bearer ${token}` },
    });

    toast.success(`🗑️ ${label} deleted`);
    dispatch(setSuccess());
  } catch (err) {
    handleError(dispatch, err, `Delete ${label}`);
  } finally {
    dispatch(setLoading(false));
  }
};

