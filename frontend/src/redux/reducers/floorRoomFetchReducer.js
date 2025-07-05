import {
  SET_FR_LOADING,
  SET_FR_SUCCESS,
  SET_FR_ERROR,
  SET_FR_DATA,
} from "../actions/floorRoomFetchActions";

const initialState = {
  loading: false,
  error: null,
  success: false,
  data: {},  
};

export const floorRoomFetchReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_FR_LOADING:
      return { ...state, loading: action.payload };
    case SET_FR_SUCCESS:
      return { ...state, success: action.payload };
    case SET_FR_ERROR:
      return { ...state, error: action.payload };
    case SET_FR_DATA:
      return {
        ...state,
        data: { ...state.data, [action.payload.key]: action.payload.data },
      };
    default:
      return state;
  }
};
