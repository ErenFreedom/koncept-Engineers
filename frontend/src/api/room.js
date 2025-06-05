import axios from "axios";

const API = process.env.REACT_APP_API_BASE_URL;

export const addRoom = async (floorId, name, token) => {
  await axios.post(
    `${API}/api/room/add`,
    { floor_id: floorId, name },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const getRooms = async (token) => {
  const res = await axios.get(`${API}/api/room/list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.rooms;
};

export const deleteRoom = async (roomId, token) => {
  const res = await axios.delete(`${API}/api/room/delete`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { room_id: roomId }, 
  });
  return res.data;
};


export const addSubsiteRoom = async (floorId, name, subsiteId, token) => {
  await axios.post(
    `${API}/api/subsite/floor-room/room/add`,
    { floor_id: floorId, name, subsite_id: subsiteId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const getSubsiteRooms = async (token, subsiteId) => {
  const res = await axios.get(`${API}/api/subsite/room/list`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { subsite_id: subsiteId },
  });
  return res.data.rooms;
};

export const deleteSubsiteRoom = async (roomId, subsiteId, token) => {
  const res = await axios.post(
    `${API}/api/subsite/floor-room/room/delete`,
    { room_id: roomId, subsite_id: subsiteId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};