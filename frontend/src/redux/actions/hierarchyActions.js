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

    const [floors, rooms, floorAreas, roomSegments, poes] = await Promise.all([
      axios.get(`${process.env.REACT_APP_API_BASE_URL}/api${prefix}/floors${query}`, config),
      axios.get(`${process.env.REACT_APP_API_BASE_URL}/api${prefix}/rooms${query}`, config),
      axios.get(`${process.env.REACT_APP_API_BASE_URL}/api${prefix}/floor-areas${query}`, config),
      axios.get(`${process.env.REACT_APP_API_BASE_URL}/api${prefix}/room-segments${query}`, config),
      axios.get(`${process.env.REACT_APP_API_BASE_URL}/api${prefix}/poes${query}`, config),
    ]);

    dispatch({
      type: FETCH_HIERARCHY_DATA_SUCCESS,
      payload: {
        floors: floors.data.floors,
        rooms: rooms.data.rooms,
        floorAreas: floorAreas.data.floorAreas,
        roomSegments: roomSegments.data.roomSegments,
        poes: poes.data.piecesOfEquipment,
      },
    });
  } catch (error) {
    dispatch({
      type: FETCH_HIERARCHY_DATA_FAIL,
      payload:
        error.response?.data?.message || error.message || "Failed to fetch hierarchy data",
    });
  }
};
