const initialState = {
  loading: false,
  error: null,
  success: null,
};

const siteReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SITE_SET_LOADING":
      return { ...state, loading: action.payload };
    case "SITE_SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "SITE_SET_SUCCESS":
      return { ...state, success: action.payload, error: null, loading: false };
    default:
      return state;
  }
};

export default siteReducer;
