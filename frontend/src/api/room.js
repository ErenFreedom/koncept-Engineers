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
