import axios from "axios";
import { toast } from "react-toastify";
import {
  SUBSITE_REQUEST,
  SUBSITE_SUCCESS,
  SUBSITE_FAIL,
} from "../constants/subsiteConstants";

const API = process.env.REACT_APP_API_BASE_URL + "/api";

export const sendSubSiteOtp = (data, token) => async (dispatch) => {
  try {
    dispatch({ type: SUBSITE_REQUEST });
    await axios.post(`${API}/subsite/send-otp`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success("✅ OTP sent successfully");
    dispatch({ type: SUBSITE_SUCCESS });
  } catch (err) {
    toast.error(`❌ Send OTP failed: ${err.response?.data?.message || err.message}`);
    dispatch({
      type: SUBSITE_FAIL,
      payload: err.response?.data?.message || err.message,
    });
  }
};

export const registerSubSite = (data, token) => async (dispatch) => {
  try {
    dispatch({ type: SUBSITE_REQUEST });
    await axios.post(`${API}/subsite/register`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success("✅ Sub-site registered successfully");
    dispatch({ type: SUBSITE_SUCCESS });
  } catch (err) {
    toast.error(`❌ Register failed: ${err.response?.data?.message || err.message}`);
    dispatch({
      type: SUBSITE_FAIL,
      payload: err.response?.data?.message || err.message,
    });
  }
};

export const fetchSubSites = (token) => async (dispatch) => {
  try {
    dispatch({ type: SUBSITE_REQUEST });
    const { data } = await axios.get(`${API}/list`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    dispatch({ type: SUBSITE_SUCCESS, payload: data.subsites });
  } catch (err) {
    toast.error(`❌ Fetch sub-sites failed: ${err.response?.data?.message || err.message}`);
    dispatch({
      type: SUBSITE_FAIL,
      payload: err.response?.data?.message || err.message,
    });
  }
};

export const fetchMainSiteInfo = (token) => async (dispatch) => {
  try {
    dispatch({ type: SUBSITE_REQUEST });
    const { data } = await axios.get(`${API}/main-site/info`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    dispatch({ type: SUBSITE_SUCCESS, payload: data });
  } catch (err) {
    toast.error(`❌ Fetch main site failed: ${err.response?.data?.message || err.message}`);
    dispatch({
      type: SUBSITE_FAIL,
      payload: err.response?.data?.message || err.message,
    });
  }
};

export const editMainSiteInfo = (data, token) => async (dispatch) => {
  try {
    dispatch({ type: SUBSITE_REQUEST });
    await axios.put(`${API}/main-site/edit`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success("✅ Main site updated");
    dispatch({ type: SUBSITE_SUCCESS });
  } catch (err) {
    toast.error(`❌ Edit main site failed: ${err.response?.data?.message || err.message}`);
    dispatch({
      type: SUBSITE_FAIL,
      payload: err.response?.data?.message || err.message,
    });
  }
};

export const editSubSiteInfo = (data, token) => async (dispatch) => {
  try {
    dispatch({ type: SUBSITE_REQUEST });
    await axios.put(`${API}/subsite/edit`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success("✅ Sub-site updated");
    dispatch({ type: SUBSITE_SUCCESS });
  } catch (err) {
    toast.error(`❌ Edit sub-site failed: ${err.response?.data?.message || err.message}`);
    dispatch({
      type: SUBSITE_FAIL,
      payload: err.response?.data?.message || err.message,
    });
  }
};

export const deleteSubSite = (data, token) => async (dispatch) => {
  try {
    dispatch({ type: SUBSITE_REQUEST });
    await axios.delete(`${API}/subsite/delete`, {
      data,
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success("🗑️ Sub-site deleted");
    dispatch({ type: SUBSITE_SUCCESS });
  } catch (err) {
    toast.error(`❌ Delete sub-site failed: ${err.response?.data?.message || err.message}`);
    dispatch({
      type: SUBSITE_FAIL,
      payload: err.response?.data?.message || err.message,
    });
  }
};
