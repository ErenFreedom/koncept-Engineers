const db = require("../db/connector");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const decodeToken = (req) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    console.error("❌ Invalid token:", err.message);
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

const addSubSiteFloor = async (req, res) => {
  const { name, subsite_id } = req.body;
  const decoded = decodeToken(req);

  if (!decoded?.companyId || !subsite_id)
    return res.status(401).json({ message: "Missing company/sub-site info" });

  const { floorTable } = getTableNames(decoded.companyId, subsite_id);

  try {
    const [existing] = await db.execute(`SELECT id FROM ${floorTable} WHERE name = ?`, [name]);
    if (existing.length > 0) return res.status(400).json({ message: "Floor already exists" });

    await db.execute(`INSERT INTO ${floorTable} (name) VALUES (?)`, [name]);
    res.status(201).json({ message: "✅ Floor added" });
  } catch (err) {
    console.error("❌ Error adding floor:", err.message);
    res.status(500).json({ message: "Failed to add floor" });
  }
};

const addSubSiteRoom = async (req, res) => {
  const { name, floor_id, subsite_id } = req.body;
  const decoded = decodeToken(req);

  if (!decoded?.companyId || !subsite_id)
    return res.status(401).json({ message: "Missing company/sub-site info" });

  const { roomTable } = getTableNames(decoded.companyId, subsite_id);

  try {
    const [existing] = await db.execute(
      `SELECT id FROM ${roomTable} WHERE floor_id = ? AND name = ?`,
      [floor_id, name]
    );
    if (existing.length > 0)
      return res.status(400).json({ message: "Room already exists on this floor" });

    await db.execute(`INSERT INTO ${roomTable} (floor_id, name) VALUES (?, ?)`, [floor_id, name]);
    res.status(201).json({ message: "✅ Room added" });
  } catch (err) {
    console.error("❌ Error adding room:", err.message);
    res.status(500).json({ message: "Failed to add room" });
  }
};

const deleteSubSiteFloor = async (req, res) => {
  const { floor_id, subsite_id } = req.body;
  const decoded = decodeToken(req);

  if (!decoded?.companyId || !subsite_id)
    return res.status(401).json({ message: "Missing company/sub-site info" });

  const { floorTable, roomTable } = getTableNames(decoded.companyId, subsite_id);

  try {
    const [rooms] = await db.execute(`SELECT id FROM ${roomTable} WHERE floor_id = ?`, [floor_id]);
    if (rooms.length > 0)
      return res.status(400).json({ message: "Floor has rooms. Delete them first." });

    const [result] = await db.execute(`DELETE FROM ${floorTable} WHERE id = ?`, [floor_id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Floor not found" });

    res.status(200).json({ message: "✅ Floor deleted" });
  } catch (err) {
    console.error("❌ Error deleting floor:", err.message);
    res.status(500).json({ message: "Failed to delete floor" });
  }
};

const deleteSubSiteRoom = async (req, res) => {
  const { room_id, subsite_id } = req.body;
  const decoded = decodeToken(req);

  if (!decoded?.companyId || !subsite_id)
    return res.status(401).json({ message: "Missing company/sub-site info" });

  const { roomTable, sensorTable } = getTableNames(decoded.companyId, subsite_id);

  try {
    const [sensors] = await db.execute(`SELECT id FROM ${sensorTable} WHERE room_id = ?`, [room_id]);
    if (sensors.length > 0)
      return res.status(400).json({ message: "Room has sensors assigned" });

    const [result] = await db.execute(`DELETE FROM ${roomTable} WHERE id = ?`, [room_id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Room not found" });

    res.status(200).json({ message: "✅ Room deleted" });
  } catch (err) {
    console.error("❌ Error deleting room:", err.message);
    res.status(500).json({ message: "Failed to delete room" });
  }
};

const assignSensorToSubSiteRoom = async (req, res) => {
  const { bank_id, room_id, subsite_id } = req.body;
  const decoded = decodeToken(req);

  if (!decoded?.companyId || !subsite_id)
    return res.status(401).json({ message: "Missing company/sub-site info" });

  const { sensorTable } = getTableNames(decoded.companyId, subsite_id);

  try {
    const [result] = await db.execute(
      `UPDATE ${sensorTable} SET room_id = ? WHERE id = ?`,
      [room_id, bank_id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Sensor not found" });

    res.status(200).json({ message: "✅ Sensor assigned" });
  } catch (err) {
    console.error("❌ Error assigning sensor:", err.message);
    res.status(500).json({ message: "Failed to assign sensor" });
  }
};

const unassignSensorFromSubSiteRoom = async (req, res) => {
  const { bank_id, subsite_id } = req.body;
  const decoded = decodeToken(req);

  if (!decoded?.companyId || !subsite_id)
    return res.status(401).json({ message: "Missing company/sub-site info" });

  const { sensorTable } = getTableNames(decoded.companyId, subsite_id);

  try {
    const [result] = await db.execute(
      `UPDATE ${sensorTable} SET room_id = NULL WHERE id = ?`,
      [bank_id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Sensor not found or already unassigned" });

    res.status(200).json({ message: `✅ Sensor ${bank_id} unassigned from room` });
  } catch (err) {
    console.error("❌ Error unassigning sensor:", err.message);
    res.status(500).json({ message: "Failed to unassign sensor" });
  }
};

module.exports = {
  addSubSiteFloor,
  addSubSiteRoom,
  deleteSubSiteFloor,
  deleteSubSiteRoom,
  assignSensorToSubSiteRoom,
  unassignSensorFromSubSiteRoom,
};
