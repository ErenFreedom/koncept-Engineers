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

export const unassignSensorFromRoom = async (bankId, token) => {
  await axios.post(
    `${API}/api/sensor/unassign-room`,
    { bank_id: bankId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};


export const getSubsiteSensors = async (token, subsiteId) => {
  const res = await axios.get(`${API}/api/subsite/sensor/list`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { subsite_id: subsiteId },
  });
  return res.data.sensors;
};

export const assignSensorToSubsiteRoom = async (bankId, roomId, subsiteId, token) => {
  await axios.post(
    `${API}/api/subsite/floor-room/sensor/assign`,
    { bank_id: bankId, room_id: roomId, subsite_id: subsiteId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const unassignSensorFromSubsiteRoom = async (bankId, subsiteId, token) => {
  await axios.post(
    `${API}/api/subsite/floor-room/sensor/unassign`,
    { bank_id: bankId, subsite_id: subsiteId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};