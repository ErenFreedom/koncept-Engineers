import {
  SUBSITE_SET_LOADING,
  SUBSITE_SET_ERROR,
  SUBSITE_SET_SUCCESS,
} from "../actions/subSiteStructureActions";

const initialState = {
  loading: false,
  error: null,
  success: null,
};

const subSiteStructureReducer = (state = initialState, action) => {
  switch (action.type) {
    case SUBSITE_SET_LOADING:
      return { ...state, loading: action.payload };
    case SUBSITE_SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case SUBSITE_SET_SUCCESS:
      return { ...state, success: true, error: null, loading: false };
    default:
      return state;
  }
};

export default subSiteStructureReducer;
