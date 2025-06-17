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
  if (!decoded?.companyId)
    return res.status(401).json({ message: "Unauthorized" });

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
  if (!decoded?.companyId)
    return res.status(401).json({ message: "Unauthorized" });

  const roomTable = `Room_${decoded.companyId}`;
  try {
    const [rows] = await db.query(`SELECT id, name, floor_id FROM ${roomTable}`);
    res.status(200).json({ rooms: rows });
  } catch (err) {
    console.error("❌ Failed to fetch rooms:", err.message);
    res.status(500).json({ message: "Failed to fetch rooms" });
  }
};

const getFloorAreas = async (req, res) => {
  const decoded = decodeToken(req);
  if (!decoded?.companyId)
    return res.status(401).json({ message: "Unauthorized" });

  const table = `FloorArea_${decoded.companyId}`;
  try {
    const [rows] = await db.query(`SELECT id, name, floor_id FROM ${table}`);
    res.status(200).json({ floorAreas: rows });
  } catch (err) {
    console.error("❌ Failed to fetch floor areas:", err.message);
    res.status(500).json({ message: "Failed to fetch floor areas" });
  }
};

const getRoomSegments = async (req, res) => {
  const decoded = decodeToken(req);
  if (!decoded?.companyId)
    return res.status(401).json({ message: "Unauthorized" });

  const table = `RoomSegment_${decoded.companyId}`;
  try {
    const [rows] = await db.query(`SELECT id, name, room_id FROM ${table}`);
    res.status(200).json({ roomSegments: rows });
  } catch (err) {
    console.error("❌ Failed to fetch room segments:", err.message);
    res.status(500).json({ message: "Failed to fetch room segments" });
  }
};

const getPoEs = async (req, res) => {
  const decoded = decodeToken(req);
  if (!decoded?.companyId)
    return res.status(401).json({ message: "Unauthorized" });

  const table = `PieceOfEquipment_${decoded.companyId}`;
  try {
    const [rows] = await db.query(
      `SELECT id, name, location_type, location_id FROM ${table}`
    );
    res.status(200).json({ piecesOfEquipment: rows });
  } catch (err) {
    console.error("❌ Failed to fetch PoEs:", err.message);
    res.status(500).json({ message: "Failed to fetch pieces of equipment" });
  }
};


const getSubSiteFloors = async (req, res) => {
  const decoded = decodeToken(req);
  const subsiteId = req.query.subsite_id || req.query.subsiteId;

  if (!decoded?.companyId || !subsiteId)
    return res.status(401).json({ message: "Unauthorized or missing sub-site ID" });

  const table = `Floor_${decoded.companyId}_${subsiteId}`;
  try {
    const [rows] = await db.query(`SELECT id, name FROM ${table}`);
    res.status(200).json({ floors: rows });
  } catch (err) {
    console.error("❌ Failed to fetch sub-site floors:", err.message);
    res.status(500).json({ message: "Failed to fetch sub-site floors" });
  }
};

const getSubSiteRooms = async (req, res) => {
  const decoded = decodeToken(req);
  const subsiteId = req.query.subsite_id || req.query.subsiteId;

  if (!decoded?.companyId || !subsiteId)
    return res.status(401).json({ message: "Unauthorized or missing sub-site ID" });

  const table = `Room_${decoded.companyId}_${subsiteId}`;
  try {
    const [rows] = await db.query(`SELECT id, name, floor_id FROM ${table}`);
    res.status(200).json({ rooms: rows });
  } catch (err) {
    console.error("❌ Failed to fetch sub-site rooms:", err.message);
    res.status(500).json({ message: "Failed to fetch sub-site rooms" });
  }
};

const getSubSiteFloorAreas = async (req, res) => {
  const decoded = decodeToken(req);
  const subsiteId = req.query.subsite_id || req.query.subsiteId;

  if (!decoded?.companyId || !subsiteId)
    return res.status(401).json({ message: "Unauthorized or missing sub-site ID" });

  const table = `FloorArea_${decoded.companyId}_${subsiteId}`;
  try {
    const [rows] = await db.query(`SELECT id, name, floor_id FROM ${table}`);
    res.status(200).json({ floorAreas: rows });
  } catch (err) {
    console.error("❌ Failed to fetch sub-site floor areas:", err.message);
    res.status(500).json({ message: "Failed to fetch sub-site floor areas" });
  }
};

const getSubSiteRoomSegments = async (req, res) => {
  const decoded = decodeToken(req);
  const subsiteId = req.query.subsite_id || req.query.subsiteId;

  if (!decoded?.companyId || !subsiteId)
    return res.status(401).json({ message: "Unauthorized or missing sub-site ID" });

  const table = `RoomSegment_${decoded.companyId}_${subsiteId}`;
  try {
    const [rows] = await db.query(`SELECT id, name, room_id FROM ${table}`);
    res.status(200).json({ roomSegments: rows });
  } catch (err) {
    console.error("❌ Failed to fetch sub-site room segments:", err.message);
    res.status(500).json({ message: "Failed to fetch sub-site room segments" });
  }
};

const getSubSitePoEs = async (req, res) => {
  const decoded = decodeToken(req);
  const subsiteId = req.query.subsite_id || req.query.subsiteId;

  if (!decoded?.companyId || !subsiteId)
    return res.status(401).json({ message: "Unauthorized or missing sub-site ID" });

  const table = `PieceOfEquipment_${decoded.companyId}_${subsiteId}`;
  try {
    const [rows] = await db.query(
      `SELECT id, name, location_type, location_id FROM ${table}`
    );
    res.status(200).json({ piecesOfEquipment: rows });
  } catch (err) {
    console.error("❌ Failed to fetch sub-site PoEs:", err.message);
    res.status(500).json({ message: "Failed to fetch sub-site equipment" });
  }
};





module.exports = {
  getFloors,
  getRooms,
  getFloorAreas,
  getRoomSegments,
  getPoEs,
  getSubSiteFloors,
  getSubSiteRooms,
  getSubSiteFloorAreas,
  getSubSiteRoomSegments,
  getSubSitePoEs,
};
