import { SENSOR_MOUNT_REQUEST, SENSOR_MOUNT_SUCCESS, SENSOR_MOUNT_FAIL } from "../actions/sensorMountActions";

const initialState = {
  loading: false,
  error: null,
  path: null,  
};

export const sensorMountReducer = (state = initialState, action) => {
  switch (action.type) {
    case SENSOR_MOUNT_REQUEST:
      return { ...state, loading: true, error: null };
    case SENSOR_MOUNT_SUCCESS:
      return { ...state, loading: false, error: null, path: action.payload || null };
    case SENSOR_MOUNT_FAIL:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
