import {
  SENSOR_DATA_REQUEST,
  SENSOR_DATA_SUCCESS,
  SENSOR_DATA_FAIL,
} from "../actions/displaySensorDataActions";

const initialState = {
  loading: false,
  sensors: [],
  error: null,
};

export const displaySensorDataReducer = (state = initialState, action) => {
  switch (action.type) {
    case SENSOR_DATA_REQUEST:
      return { ...state, loading: true, error: null };
    case SENSOR_DATA_SUCCESS:
      return { ...state, loading: false, sensors: action.payload };
    case SENSOR_DATA_FAIL:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
