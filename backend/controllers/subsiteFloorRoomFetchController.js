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

const getTableNames = (companyId, subSiteId) => {
  return {
    floorTable: `Floor_${companyId}_${subSiteId}`,
    roomTable: `Room_${companyId}_${subSiteId}`,
    sensorTable: `SensorBank_${companyId}_${subSiteId}`,
  };
};

const getSubSiteFloors = async (req, res) => {
  const decoded = decodeToken(req);
  const subSiteId = req.body.subsite_id || req.query.subsite_id;

  if (!decoded?.companyId || !subSiteId)
    return res.status(401).json({ message: "Missing company/subsite info" });

  const { floorTable } = getTableNames(decoded.companyId, subSiteId);

  try {
    const [rows] = await db.query(`SELECT id, name FROM ${floorTable}`);
    res.status(200).json({ floors: rows });
  } catch (err) {
    console.error("❌ Failed to fetch sub-site floors:", err.message);
    res.status(500).json({ message: "Failed to fetch sub-site floors" });
  }
};

const getSubSiteRooms = async (req, res) => {
  const decoded = decodeToken(req);
  const subSiteId = req.body.subsite_id || req.query.subsite_id;

  if (!decoded?.companyId || !subSiteId)
    return res.status(401).json({ message: "Missing company/subsite info" });

  const { roomTable } = getTableNames(decoded.companyId, subSiteId);

  try {
    const [rows] = await db.query(`SELECT id, name, floor_id FROM ${roomTable}`);
    res.status(200).json({ rooms: rows });
  } catch (err) {
    console.error("❌ Failed to fetch sub-site rooms:", err.message);
    res.status(500).json({ message: "Failed to fetch sub-site rooms" });
  }
};

const getSubSiteSensors = async (req, res) => {
  const decoded = decodeToken(req);
  const subSiteId = req.body.subsite_id || req.query.subsite_id;

  if (!decoded?.companyId || !subSiteId)
    return res.status(401).json({ message: "Missing company/subsite info" });

  const { sensorTable } = getTableNames(decoded.companyId, subSiteId);

  try {
    const [rows] = await db.query(`SELECT id, name, object_id, room_id FROM ${sensorTable}`);
    res.status(200).json({ sensors: rows });
  } catch (err) {
    console.error("❌ Failed to fetch sub-site sensors:", err.message);
    res.status(500).json({ message: "Failed to fetch sub-site sensors" });
  }
};

module.exports = {
  getSubSiteFloors,
  getSubSiteRooms,
  getSubSiteSensors,
};
