const db = require("../db/connector");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const decodeToken = (req) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    console.error("❌ Token decode failed:", err.message);
    return null;
  }
};

const getFloors = async (req, res) => {
  const decoded = decodeToken(req);
  if (!decoded?.companyId) return res.status(401).json({ message: "Unauthorized" });

  const floorTable = `Floor_${decoded.companyId}`;
  try {
    const [rows] = await db.query(`SELECT id, name FROM ${floorTable}`);
    res.status(200).json({ floors: rows });
  } catch (err) {
    console.error("❌ Failed to fetch floors:", err.message);
    res.status(500).json({ message: "Failed to fetch floors" });
  }
};

const getRooms = async (req, res) => {
  const decoded = decodeToken(req);
  if (!decoded?.companyId) return res.status(401).json({ message: "Unauthorized" });

  const roomTable = `Room_${decoded.companyId}`;
  try {
    const [rows] = await db.query(`SELECT id, name, floor_id FROM ${roomTable}`);
    res.status(200).json({ rooms: rows });
  } catch (err) {
    console.error("❌ Failed to fetch rooms:", err.message);
    res.status(500).json({ message: "Failed to fetch rooms" });
  }
};

const getSensors = async (req, res) => {
  const decoded = decodeToken(req);
  if (!decoded?.companyId) return res.status(401).json({ message: "Unauthorized" });

  const sensorTable = `SensorBank_${decoded.companyId}`;
  try {
    const [rows] = await db.query(`SELECT id, name, object_id, room_id FROM ${sensorTable}`);
    res.status(200).json({ sensors: rows });
  } catch (err) {
    console.error("❌ Failed to fetch sensors:", err.message);
    res.status(500).json({ message: "Failed to fetch sensors" });
  }
};

module.exports = { getFloors, getRooms, getSensors };
