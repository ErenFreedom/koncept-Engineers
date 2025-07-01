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
    const baseUrl = `${process.env.REACT_APP_API_BASE_URL}/api${prefix}`;

    const safeGet = async (url, name) => {
      try {
        const res = await axios.get(url, config);
        console.log(`✅ ${name} API success:`, res.data);
        return res.data;
      } catch (e) {
        console.error(`❌ ${name} API failed:`, e.response?.data || e.message);
        return null; 
      }
    };

    const [
      floorsData,
      roomsData,
      floorAreasData,
      roomSegmentsData,
      poesData,
      subsitesData,  
    ] = await Promise.all([
      safeGet(`${baseUrl}/floors${query}`, "Floors"),
      safeGet(`${baseUrl}/rooms${query}`, "Rooms"),
      safeGet(`${baseUrl}/floor-areas${query}`, "FloorAreas"),
      safeGet(`${baseUrl}/room-segments${query}`, "RoomSegments"),
      safeGet(`${baseUrl}/poes${query}`, "PoEs"),
      safeGet(`${process.env.REACT_APP_API_BASE_URL}/api/list`, "SubSites"), 
    ]);

    const allFailed = [floorsData, roomsData, floorAreasData, roomSegmentsData, poesData]
      .every((d) => d === null);

    if (allFailed) {
      dispatch({
        type: FETCH_HIERARCHY_DATA_FAIL,
        payload: "All hierarchy data requests failed",
      });
      return;
    }

    for (const subsite of subsitesData?.subsites || []) {
      const subsiteId = subsite.subSiteId;
      const subQuery = `?subsite_id=${subsiteId}`;
      const subBase = `${process.env.REACT_APP_API_BASE_URL}/api/subsite`;

      const [
        subFloors,
        subRooms,
        subFloorAreas,
        subRoomSegments,
        subPoes,
      ] = await Promise.all([
        safeGet(`${subBase}/floors${subQuery}`, `Subsite ${subsiteId} Floors`),
        safeGet(`${subBase}/rooms${subQuery}`, `Subsite ${subsiteId} Rooms`),
        safeGet(`${subBase}/floor-areas${subQuery}`, `Subsite ${subsiteId} FloorAreas`),
        safeGet(`${subBase}/room-segments${subQuery}`, `Subsite ${subsiteId} RoomSegments`),
        safeGet(`${subBase}/poes${subQuery}`, `Subsite ${subsiteId} PoEs`),
      ]);

      subsite.subsiteFloors = subFloors?.floors || [];
      subsite.rooms = subRooms?.rooms || [];
      subsite.floorAreas = subFloorAreas?.floorAreas || [];
      subsite.roomSegments = subRoomSegments?.roomSegments || [];
      subsite.poes = subPoes?.piecesOfEquipment || [];
    }

    dispatch({
      type: FETCH_HIERARCHY_DATA_SUCCESS,
      payload: {
        floors: floorsData?.floors || [],
        rooms: roomsData?.rooms || [],
        floorAreas: floorAreasData?.floorAreas || [],
        roomSegments: roomSegmentsData?.roomSegments || [],
        poes: poesData?.piecesOfEquipment || [],
        subsites: subsitesData?.subsites || [], 
      },
    });
  } catch (error) {
    console.error("❌ Unexpected hierarchy fetch error:", error.response?.data || error.message);
    dispatch({
      type: FETCH_HIERARCHY_DATA_FAIL,
      payload: error.response?.data?.message || error.message || "Unexpected error fetching hierarchy data",
    });
  }
};
