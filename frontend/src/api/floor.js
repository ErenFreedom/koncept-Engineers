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
