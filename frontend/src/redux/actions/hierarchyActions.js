import axios from "axios";
import {
  FETCH_HIERARCHY_DATA_REQUEST,
  FETCH_HIERARCHY_DATA_SUCCESS,
  FETCH_HIERARCHY_DATA_FAIL,
} from "../constants/hierarchyConstants";

export const fetchHierarchyData = (subsiteId = null, token) => async (dispatch) => {
  try {
    dispatch({ type: FETCH_HIERARCHY_DATA_REQUEST });

    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    const prefix = subsiteId ? "/subsite" : "";
    const query = subsiteId ? `?subsite_id=${subsiteId}` : "";

    const requests = [
      axios
        .get(`${process.env.REACT_APP_API_BASE_URL}/api${prefix}/floors${query}`, config)
        .catch((e) => {
          console.error("❌ Floors API failed:", e.response?.data || e.message);
          throw e;
        }),
      axios
        .get(`${process.env.REACT_APP_API_BASE_URL}/api${prefix}/rooms${query}`, config)
        .catch((e) => {
          console.error("❌ Rooms API failed:", e.response?.data || e.message);
          throw e;
        }),
      axios
        .get(`${process.env.REACT_APP_API_BASE_URL}/api${prefix}/floor-areas${query}`, config)
        .catch((e) => {
          console.error("❌ FloorAreas API failed:", e.response?.data || e.message);
          throw e;
        }),
      axios
        .get(`${process.env.REACT_APP_API_BASE_URL}/api${prefix}/room-segments${query}`, config)
        .catch((e) => {
          console.error("❌ RoomSegments API failed:", e.response?.data || e.message);
          throw e;
        }),
      axios
        .get(`${process.env.REACT_APP_API_BASE_URL}/api${prefix}/poes${query}`, config)
        .catch((e) => {
          console.error("❌ PoEs API failed:", e.response?.data || e.message);
          throw e;
        }),
    ];

    const [floors, rooms, floorAreas, roomSegments, poes] = await Promise.all(requests);

    dispatch({
      type: FETCH_HIERARCHY_DATA_SUCCESS,
      payload: {
        // Defensive fallback: avoid undefined even if API returns 204 or empty response
        floors: floors.data?.floors || [],
        rooms: rooms.data?.rooms || [],
        floorAreas: floorAreas.data?.floorAreas || [],
        roomSegments: roomSegments.data?.roomSegments || [],
        poes: poes.data?.piecesOfEquipment || [],
      },
    });
  } catch (error) {
    console.error("❌ Hierarchy data fetch error:", error.response?.data || error.message);
    dispatch({
      type: FETCH_HIERARCHY_DATA_FAIL,
      payload:
        error.response?.data?.message || error.message || "Failed to fetch hierarchy data",
    });
  }
};
