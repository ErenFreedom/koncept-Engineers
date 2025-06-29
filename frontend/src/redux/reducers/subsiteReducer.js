import {
  SUBSITE_REQUEST,
  SUBSITE_SUCCESS,
  SUBSITE_FAIL,
} from "../constants/subsiteConstants";

const initialState = {
  loading: false,
  error: null,
  success: false,
  data: null,
};

export const subsiteReducer = (state = initialState, action) => {
  switch (action.type) {
    case SUBSITE_REQUEST:
      return { ...state, loading: true, error: null, success: false };
    case SUBSITE_SUCCESS:
      return { ...state, loading: false, success: true, data: action.payload || null };
    case SUBSITE_FAIL:
      return { ...state, loading: false, error: action.payload, success: false };
    default:
      return state;
  }
};
