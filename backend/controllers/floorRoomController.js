const db = require("../db/connector");
const jwt = require("jsonwebtoken");

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
  const { name } = req.body;
  const decoded = decodeToken(req);

  if (!decoded || !decoded.companyId) {
    return res.status(401).json({ message: "Unauthorized or invalid token" });
  }

  const companyId = decoded.companyId;
  const floorTable = `Floor_${companyId}`;

  try {
    
    const [existing] = await db.execute(
      `SELECT id FROM ${floorTable} WHERE name = ?`,
      [name]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "🚫 Floor with this name already exists." });
    }

    
    await db.execute(
      `INSERT INTO ${floorTable} (name) VALUES (?)`,
      [name]
    );
    res.status(201).json({ message: "✅ Floor added successfully" });
  } catch (err) {
    console.error("❌ Failed to add floor:", err.message);
    res.status(500).json({ message: "Failed to add floor", error: err.message });
  }
};


const addRoom = async (req, res) => {
  const { floor_id, name } = req.body;
  const decoded = decodeToken(req);

  if (!decoded || !decoded.companyId) {
    return res.status(401).json({ message: "Unauthorized or invalid token" });
  }

  const companyId = decoded.companyId;
  const roomTable = `Room_${companyId}`;

  try {
    
    const [existing] = await db.execute(
      `SELECT id FROM ${roomTable} WHERE floor_id = ? AND name = ?`,
      [floor_id, name]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "🚫 Room with this name already exists on this floor." });
    }

    
    await db.execute(
      `INSERT INTO ${roomTable} (floor_id, name) VALUES (?, ?)`,
      [floor_id, name]
    );
    res.status(201).json({ message: "✅ Room added successfully" });
  } catch (err) {
    console.error("❌ Failed to add room:", err.message);
    res.status(500).json({ message: "Failed to add room", error: err.message });
  }
};


const assignSensorToRoom = async (req, res) => {
    const { bank_id, room_id } = req.body;
    const decoded = decodeToken(req);
  
    if (!decoded || !decoded.companyId) {
      return res.status(401).json({ message: "Unauthorized or invalid token" });
    }
  
    const companyId = decoded.companyId;
    const sensorTable = `SensorBank_${companyId}`;
  
    try {
      const [result] = await db.execute(
        `UPDATE ${sensorTable} SET room_id = ? WHERE id = ?`,
        [room_id, bank_id]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Sensor not found or update failed." });
      }
  
      res.status(200).json({ message: `✅ Sensor ${bank_id} assigned to Room ${room_id}` });
    } catch (err) {
      console.error("❌ Failed to assign sensor to room:", err.message);
      res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
  };


  const deleteRoom = async (req, res) => {
    const { room_id } = req.body;
    const decoded = decodeToken(req);
    if (!decoded || !decoded.companyId)
      return res.status(401).json({ message: "Unauthorized" });
  
    const companyId = decoded.companyId;
    const roomTable = `Room_${companyId}`;
    const sensorTable = `SensorBank_${companyId}`;
  
    try {
      const [sensors] = await db.execute(
        `SELECT id FROM ${sensorTable} WHERE room_id = ?`,
        [room_id]
      );
  
      if (sensors.length > 0) {
        return res.status(400).json({ message: "Cannot delete room: sensors are still assigned." });
      }
  
      const [result] = await db.execute(`DELETE FROM ${roomTable} WHERE id = ?`, [room_id]);
  
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Room not found" });
  
      res.status(200).json({ message: `✅ Room ${room_id} deleted successfully` });
    } catch (err) {
      console.error("❌ Error deleting room:", err.message);
      res.status(500).json({ message: "Failed to delete room", error: err.message });
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
  
    try {
      const [rooms] = await db.execute(
        `SELECT id FROM ${roomTable} WHERE floor_id = ?`,
        [floor_id]
      );
  
      if (rooms.length > 0) {
        return res.status(400).json({ message: "Cannot delete floor: rooms still exist on it." });
      }
  
      const [result] = await db.execute(`DELETE FROM ${floorTable} WHERE id = ?`, [floor_id]);
  
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Floor not found" });
  
      res.status(200).json({ message: `✅ Floor ${floor_id} deleted successfully` });
    } catch (err) {
      console.error("❌ Error deleting floor:", err.message);
      res.status(500).json({ message: "Failed to delete floor", error: err.message });
    }
  };

  const unassignSensorFromRoom = async (req, res) => {
    const { bank_id } = req.body;
    const decoded = decodeToken(req);
  
    if (!decoded || !decoded.companyId) {
      return res.status(401).json({ message: "Unauthorized or invalid token" });
    }
  
    const companyId = decoded.companyId;
    const sensorTable = `SensorBank_${companyId}`;
  
    try {
      const [result] = await db.execute(
        `UPDATE ${sensorTable} SET room_id = NULL WHERE id = ?`,
        [bank_id]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Sensor not found or already unassigned" });
      }
  
      res.status(200).json({ message: `✅ Sensor ${bank_id} unassigned from room successfully` });
    } catch (err) {
      console.error("❌ Failed to unassign sensor:", err.message);
      res.status(500).json({ message: "Failed to unassign sensor", error: err.message });
    }
  };
  
  
  
module.exports = { addFloor, addRoom, assignSensorToRoom , deleteRoom, deleteFloor, unassignSensorFromRoom};
