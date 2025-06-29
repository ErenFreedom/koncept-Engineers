import {
  FETCH_HIERARCHY_DATA_REQUEST,
  FETCH_HIERARCHY_DATA_SUCCESS,
  FETCH_HIERARCHY_DATA_FAIL,
} from "../constants/hierarchyConstants";

const initialState = {
  loading: false,
  error: null,
  floors: [],
  rooms: [],
  floorAreas: [],
  roomSegments: [],
  poes: [],
  subsites: [], 
};

export const hierarchyReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_HIERARCHY_DATA_REQUEST:
      return { ...state, loading: true, error: null };

    case FETCH_HIERARCHY_DATA_SUCCESS:
      return {
        ...state,
        loading: false,
        ...action.payload, 
      };

    case FETCH_HIERARCHY_DATA_FAIL:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};
