import axios from "axios";
const API = process.env.REACT_APP_API_BASE_URL;

export const getSensors = async (token) => {
  const res = await axios.get(`${API}/api/sensor/list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.sensors;
};

export const assignSensorToRoom = async (bankId, roomId, token) => {
  await axios.post(
    `${API}/api/sensor/assign-room`,
    { bank_id: bankId, room_id: roomId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};
