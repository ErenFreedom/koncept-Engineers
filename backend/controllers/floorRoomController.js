const db = require("../db/connector");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const JWT_SECRET = process.env.JWT_SECRET;

const decodeToken = (req) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    console.error("❌ Invalid token:", err.message);
    return null;
  }
};

const addFloor = async (req, res) => {
  const { name, floor_level } = req.body;
  const decoded = decodeToken(req);
  if (!decoded?.companyId) return res.status(401).json({ message: "Unauthorized" });

  const floorTable = `Floor_${decoded.companyId}`;

  try {
    const [existing] = await db.execute(`SELECT id FROM ${floorTable} WHERE name = ?`, [name]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "🚫 Floor already exists" });
    }

    await db.execute(`INSERT INTO ${floorTable} (name, floor_level, site_id) VALUES (?, ?, ?)`, [name, floor_level, decoded.companyId]);
    res.status(201).json({ message: "✅ Floor added successfully" });
  } catch (err) {
    console.error("❌ Failed to add floor:", err.message);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

const addRoom = async (req, res) => {
  const { name, floor_id } = req.body;
  const decoded = decodeToken(req);
  if (!decoded?.companyId) return res.status(401).json({ message: "Unauthorized" });

  const roomTable = `Room_${decoded.companyId}`;

  try {
    const [existing] = await db.execute(`SELECT id FROM ${roomTable} WHERE name = ? AND floor_id = ?`, [name, floor_id]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "🚫 Room already exists on this floor" });
    }

    await db.execute(`INSERT INTO ${roomTable} (name, floor_id) VALUES (?, ?)`, [name, floor_id]);
    res.status(201).json({ message: "✅ Room added successfully" });
  } catch (err) {
    console.error("❌ Failed to add room:", err.message);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

const addFloorArea = async (req, res) => {
  const { name, floor_id } = req.body;
  const decoded = decodeToken(req);
  if (!decoded?.companyId) return res.status(401).json({ message: "Unauthorized" });

  const floorAreaTable = `FloorArea_${decoded.companyId}`;

  try {
    const [existing] = await db.execute(`SELECT id FROM ${floorAreaTable} WHERE name = ? AND floor_id = ?`, [name, floor_id]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "🚫 Floor Area already exists on this floor" });
    }

    await db.execute(`INSERT INTO ${floorAreaTable} (name, floor_id) VALUES (?, ?)`, [name, floor_id]);
    res.status(201).json({ message: "✅ Floor Area added successfully" });
  } catch (err) {
    console.error("❌ Failed to add floor area:", err.message);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

const addRoomSegment = async (req, res) => {
  const { name, room_id } = req.body;
  const decoded = decodeToken(req);
  if (!decoded?.companyId) return res.status(401).json({ message: "Unauthorized" });

  const roomSegmentTable = `RoomSegment_${decoded.companyId}`;

  try {
    const [existing] = await db.execute(`SELECT id FROM ${roomSegmentTable} WHERE name = ? AND room_id = ?`, [name, room_id]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "🚫 Room Segment already exists in this room" });
    }

    await db.execute(`INSERT INTO ${roomSegmentTable} (name, room_id) VALUES (?, ?)`, [name, room_id]);
    res.status(201).json({ message: "✅ Room Segment added successfully" });
  } catch (err) {
    console.error("❌ Failed to add room segment:", err.message);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

const addPieceOfEquipment = async (req, res) => {
  const {
    name,
    installation_date,
    model,
    year_of_manufacture,
    discipline,
    type,
    subtype,
    serial_number,
    manufacturer,
    comment,
    location_type,
    location_id
  } = req.body;

  const decoded = decodeToken(req);
  if (!decoded?.companyId) return res.status(401).json({ message: "Unauthorized" });

  const companyId = decoded.companyId;
  const poeTable = `PieceOfEquipment_${companyId}`;

  const validLocationTypes = ["site", "floor", "floor_area", "room", "room_segment"];
  if (!validLocationTypes.includes(location_type)) {
    return res.status(400).json({ message: "🚫 Invalid location type" });
  }

  try {
    await db.execute(
      `INSERT INTO ${poeTable} 
      (name, uuid, installation_date, model, year_of_manufacture, discipline, type, subtype, serial_number, manufacturer, comment, location_type, location_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        uuidv4(),
        installation_date || null,
        model || null,
        year_of_manufacture || null,
        discipline || null,
        type || null,
        subtype || null,
        serial_number || null,
        manufacturer || null,
        comment || null,
        location_type,
        location_id
      ]
    );

    res.status(201).json({ message: "✅ Piece of Equipment added successfully" });
  } catch (err) {
    console.error("❌ Failed to add PoE:", err.message);
    res.status(500).json({ message: "Failed to add Piece of Equipment", error: err.message });
  }
};


const deleteFloor = async (req, res) => {
  const { floor_id } = req.body;
  const decoded = decodeToken(req);
  if (!decoded || !decoded.companyId)
    return res.status(401).json({ message: "Unauthorized" });

  const companyId = decoded.companyId;
  const floorTable = `Floor_${companyId}`;
  const roomTable = `Room_${companyId}`;
  const floorAreaTable = `FloorArea_${companyId}`;
  const poeTable = `PieceOfEquipment_${companyId}`;

  try {
    const [rooms] = await db.execute(`SELECT id FROM ${roomTable} WHERE floor_id = ?`, [floor_id]);
    const [areas] = await db.execute(`SELECT id FROM ${floorAreaTable} WHERE floor_id = ?`, [floor_id]);
    const [poes] = await db.execute(`SELECT id FROM ${poeTable} WHERE location_type = 'floor' AND location_id = ?`, [floor_id]);

    if (rooms.length || areas.length || poes.length) {
      return res.status(400).json({ message: "Cannot delete floor: dependent entities exist." });
    }

    const [result] = await db.execute(`DELETE FROM ${floorTable} WHERE id = ?`, [floor_id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Floor not found" });

    res.status(200).json({ message: `✅ Floor ${floor_id} deleted.` });
  } catch (err) {
    console.error("❌ Error deleting floor:", err.message);
    res.status(500).json({ message: "Failed to delete floor", error: err.message });
  }
};

const deleteRoom = async (req, res) => {
  const { room_id } = req.body;
  const decoded = decodeToken(req);
  if (!decoded || !decoded.companyId)
    return res.status(401).json({ message: "Unauthorized" });

  const companyId = decoded.companyId;
  const roomTable = `Room_${companyId}`;
  const roomSegmentTable = `RoomSegment_${companyId}`;
  const poeTable = `PieceOfEquipment_${companyId}`;

  try {
    const [segments] = await db.execute(`SELECT id FROM ${roomSegmentTable} WHERE room_id = ?`, [room_id]);
    const [poes] = await db.execute(`SELECT id FROM ${poeTable} WHERE location_type = 'room' AND location_id = ?`, [room_id]);

    if (segments.length || poes.length) {
      return res.status(400).json({ message: "Cannot delete room: dependent entities exist." });
    }

    const [result] = await db.execute(`DELETE FROM ${roomTable} WHERE id = ?`, [room_id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Room not found" });

    res.status(200).json({ message: `✅ Room ${room_id} deleted.` });
  } catch (err) {
    console.error("❌ Error deleting room:", err.message);
    res.status(500).json({ message: "Failed to delete room", error: err.message });
  }
};

const deleteFloorArea = async (req, res) => {
  const { floor_area_id } = req.body;
  const decoded = decodeToken(req);
  if (!decoded || !decoded.companyId)
    return res.status(401).json({ message: "Unauthorized" });

  const companyId = decoded.companyId;
  const floorAreaTable = `FloorArea_${companyId}`;
  const poeTable = `PieceOfEquipment_${companyId}`;

  try {
    const [poes] = await db.execute(`SELECT id FROM ${poeTable} WHERE location_type = 'floor_area' AND location_id = ?`, [floor_area_id]);
    if (poes.length) {
      return res.status(400).json({ message: "Cannot delete floor area: equipment exists." });
    }

    const [result] = await db.execute(`DELETE FROM ${floorAreaTable} WHERE id = ?`, [floor_area_id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Floor area not found" });

    res.status(200).json({ message: `✅ Floor area ${floor_area_id} deleted.` });
  } catch (err) {
    console.error("❌ Error deleting floor area:", err.message);
    res.status(500).json({ message: "Failed to delete floor area", error: err.message });
  }
};

const deleteRoomSegment = async (req, res) => {
  const { room_segment_id } = req.body;
  const decoded = decodeToken(req);
  if (!decoded || !decoded.companyId)
    return res.status(401).json({ message: "Unauthorized" });

  const companyId = decoded.companyId;
  const roomSegmentTable = `RoomSegment_${companyId}`;
  const poeTable = `PieceOfEquipment_${companyId}`;

  try {
    const [poes] = await db.execute(`SELECT id FROM ${poeTable} WHERE location_type = 'room_segment' AND location_id = ?`, [room_segment_id]);
    if (poes.length) {
      return res.status(400).json({ message: "Cannot delete room segment: equipment exists." });
    }

    const [result] = await db.execute(`DELETE FROM ${roomSegmentTable} WHERE id = ?`, [room_segment_id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Room segment not found" });

    res.status(200).json({ message: `✅ Room segment ${room_segment_id} deleted.` });
  } catch (err) {
    console.error("❌ Error deleting room segment:", err.message);
    res.status(500).json({ message: "Failed to delete room segment", error: err.message });
  }
};

const deletePieceOfEquipment = async (req, res) => {
  const { poe_id } = req.body;
  const decoded = decodeToken(req);
  if (!decoded || !decoded.companyId)
    return res.status(401).json({ message: "Unauthorized" });

  const companyId = decoded.companyId;
  const poeTable = `PieceOfEquipment_${companyId}`;
  const sensorTable = `Sensor_${companyId}`;

  try {
    const [sensors] = await db.execute(`SELECT id FROM ${sensorTable} WHERE poe_id = ?`, [poe_id]);
    if (sensors.length > 0) {
      return res.status(400).json({ message: "Cannot delete equipment: sensors are still mounted." });
    }

    const [result] = await db.execute(`DELETE FROM ${poeTable} WHERE id = ?`, [poe_id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Equipment not found" });

    res.status(200).json({ message: `✅ Equipment ${poe_id} deleted.` });
  } catch (err) {
    console.error("❌ Error deleting equipment:", err.message);
    res.status(500).json({ message: "Failed to delete equipment", error: err.message });
  }
};


const assignSensorToPoE = async (req, res) => {
  const { sensor_id, poe_id } = req.body;
  const decoded = decodeToken(req);

  if (!decoded || !decoded.companyId)
    return res.status(401).json({ message: "Unauthorized or invalid token" });

  const companyId = decoded.companyId;
  const sensorTable = `Sensor_${companyId}`;

  try {
    const [result] = await db.execute(
      `UPDATE ${sensorTable} SET poe_id = ? WHERE id = ?`,
      [poe_id, sensor_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Sensor not found or update failed." });
    }

    res.status(200).json({ message: `✅ Sensor ${sensor_id} assigned to PoE ${poe_id}` });
  } catch (err) {
    console.error("❌ Failed to assign sensor to PoE:", err.message);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};


const unassignSensorFromPoE = async (req, res) => {
  const { sensor_id } = req.body;
  const decoded = decodeToken(req);

  if (!decoded || !decoded.companyId)
    return res.status(401).json({ message: "Unauthorized or invalid token" });

  const companyId = decoded.companyId;
  const sensorTable = `Sensor_${companyId}`;

  try {
    const [result] = await db.execute(
      `UPDATE ${sensorTable} SET poe_id = NULL WHERE id = ?`,
      [sensor_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Sensor not found or already unassigned." });
    }

    res.status(200).json({ message: `✅ Sensor ${sensor_id} unassigned from PoE successfully` });
  } catch (err) {
    console.error("❌ Failed to unassign sensor:", err.message);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};



const editFloor = async (req, res) => {
  const { id, name, floor_level } = req.body;
  const decoded = decodeToken(req);
  if (!decoded?.companyId) return res.status(401).json({ message: "Unauthorized" });

  const floorTable = `Floor_${decoded.companyId}`;

  try {
    await db.execute(
      `UPDATE ${floorTable} SET name = ?, floor_level = ? WHERE id = ?`,
      [name, floor_level, id]
    );
    res.status(200).json({ message: "✅ Floor updated successfully" });
  } catch (err) {
    console.error("❌ Failed to update floor:", err.message);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

const editRoom = async (req, res) => {
  const { id, name, floor_id } = req.body;
  const decoded = decodeToken(req);
  if (!decoded?.companyId) return res.status(401).json({ message: "Unauthorized" });

  const roomTable = `Room_${decoded.companyId}`;

  try {
    await db.execute(
      `UPDATE ${roomTable} SET name = ?, floor_id = ? WHERE id = ?`,
      [name, floor_id, id]
    );
    res.status(200).json({ message: "✅ Room updated successfully" });
  } catch (err) {
    console.error("❌ Failed to update room:", err.message);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};


const editFloorArea = async (req, res) => {
  const { id, name, floor_id } = req.body;
  const decoded = decodeToken(req);
  if (!decoded?.companyId) return res.status(401).json({ message: "Unauthorized" });

  const table = `FloorArea_${decoded.companyId}`;

  try {
    await db.execute(
      `UPDATE ${table} SET name = ?, floor_id = ? WHERE id = ?`,
      [name, floor_id, id]
    );
    res.status(200).json({ message: "✅ Floor Area updated successfully" });
  } catch (err) {
    console.error("❌ Failed to update floor area:", err.message);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};


const editRoomSegment = async (req, res) => {
  const { id, name, room_id } = req.body;
  const decoded = decodeToken(req);
  if (!decoded?.companyId) return res.status(401).json({ message: "Unauthorized" });

  const table = `RoomSegment_${decoded.companyId}`;

  try {
    await db.execute(
      `UPDATE ${table} SET name = ?, room_id = ? WHERE id = ?`,
      [name, room_id, id]
    );
    res.status(200).json({ message: "✅ Room Segment updated successfully" });
  } catch (err) {
    console.error("❌ Failed to update room segment:", err.message);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};



const editPieceOfEquipment = async (req, res) => {
  const {
    id,
    name,
    installation_date,
    model,
    year_of_manufacture,
    discipline,
    type,
    subtype,
    serial_number,
    manufacturer,
    comment,
    location_type,
    location_id
  } = req.body;

  const decoded = decodeToken(req);
  if (!decoded?.companyId) return res.status(401).json({ message: "Unauthorized" });

  const poeTable = `PieceOfEquipment_${decoded.companyId}`;

  try {
    await db.execute(
      `UPDATE ${poeTable} SET 
        name = ?, installation_date = ?, model = ?, year_of_manufacture = ?, 
        discipline = ?, type = ?, subtype = ?, serial_number = ?, manufacturer = ?, 
        comment = ?, location_type = ?, location_id = ? 
        WHERE id = ?`,
      [
        name,
        installation_date || null,
        model || null,
        year_of_manufacture || null,
        discipline || null,
        type || null,
        subtype || null,
        serial_number || null,
        manufacturer || null,
        comment || null,
        location_type,
        location_id,
        id
      ]
    );

    res.status(200).json({ message: "✅ Piece of Equipment updated successfully" });
  } catch (err) {
    console.error("❌ Failed to update PoE:", err.message);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};



module.exports = {
  addFloor,
  addRoom,
  addFloorArea,
  addRoomSegment,
  addPieceOfEquipment,
  deleteFloor,
  deleteFloorArea,
  deleteRoom,
  deleteRoomSegment,
  deletePieceOfEquipment,
  assignSensorToPoE,
  unassignSensorFromPoE,
  editFloor,
  editRoom,
  editFloorArea,
  editRoomSegment,
  editPieceOfEquipment
};
