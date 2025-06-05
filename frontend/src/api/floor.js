import axios from "axios";

const API = process.env.REACT_APP_API_BASE_URL;

export const getFloors = async (token) => {
  const res = await axios.get(`${API}/api/floor/list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.floors;
};

export const addFloor = async (name, token) => {
  await axios.post(
    `${API}/api/floor/add`,
    { name },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const deleteFloor = async (floorId, token) => {
  const res = await axios.delete(`${API}/api/floor/delete`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { floor_id: floorId },
  });
  return res.data;
};


export const getSubsiteFloors = async (token, subsiteId) => {
  const res = await axios.get(`${API}/api/subsite/floor/list`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { subsite_id: subsiteId },
  });
  return res.data.floors;
};

export const addSubsiteFloor = async (name, subsiteId, token) => {
  await axios.post(
    `${API}/api/subsite/floor-room/floor/add`,
    { name, subsite_id: subsiteId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const deleteSubsiteFloor = async (floorId, subsiteId, token) => {
  const res = await axios.post(
    `${API}/api/subsite/floor-room/floor/delete`,
    { floor_id: floorId, subsite_id: subsiteId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};