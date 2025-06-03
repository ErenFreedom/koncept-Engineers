const db = require("../db/connector");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const getAdminDetailsFromToken = (req) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return null;
    return jwt.verify(token, process.env.JWT_SECRET_APP);
  } catch (error) {
    console.error("❌ Error decoding JWT:", error.message);
    return null;
  }
};

const getSubsiteSensorTables = (companyId, subsiteId) => ({
  sensorTable: `SensorBank_${companyId}_${subsiteId}`,
  apiTable: `SensorAPI_${companyId}_${subsiteId}`,
  activeTable: `Sensor_${companyId}_${subsiteId}`,
});

const addSubSiteSensor = async (req, res) => {
  try {
    const {
      sensorName,
      description,
      objectId,
      propertyName,
      dataType,
      apiEndpoint,
      subsite_id,
      subsiteId, // ✅ Accept both styles
    } = req.body;

    const subsiteIdFinal = subsite_id || subsiteId;

    const adminDetails = getAdminDetailsFromToken(req);
    if (!adminDetails || !adminDetails.companyId || !subsiteIdFinal) {
      return res.status(401).json({ message: "Unauthorized or missing sub-site info" });
    }

    const { sensorTable, apiTable } = getSubsiteSensorTables(adminDetails.companyId, subsiteIdFinal);

    // ✅ Ensure sensor table exists
    await db.execute(`
      CREATE TABLE IF NOT EXISTS ${sensorTable} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        object_id VARCHAR(255) NOT NULL UNIQUE,
        property_name VARCHAR(255) NOT NULL,
        data_type VARCHAR(50) NOT NULL,
        is_active TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // ✅ Ensure API table exists
    await db.execute(`
      CREATE TABLE IF NOT EXISTS ${apiTable} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sensor_id INT NOT NULL,
        api_endpoint TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sensor_id) REFERENCES ${sensorTable}(id) ON DELETE CASCADE
      )
    `);

    // ✅ Insert into Sensor table
    const [result] = await db.execute(
      `INSERT INTO ${sensorTable} (name, description, object_id, property_name, data_type)
       VALUES (?, ?, ?, ?, ?)`,
      [sensorName, description, objectId, propertyName, dataType]
    );

    const insertedSensorId = result.insertId;

    // ✅ Insert API
    await db.execute(
      `INSERT INTO ${apiTable} (sensor_id, api_endpoint) VALUES (?, ?)`,
      [insertedSensorId, apiEndpoint]
    );

    res.status(200).json({
      message: `Sensor + API added successfully to ${sensorTable}`,
      sensorId: insertedSensorId
    });

  } catch (error) {
    console.error("❌ Error adding subsite sensor:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


const getAllSubSiteSensors = async (req, res) => {
  try {
    const subsite_id = req.query.subsite_id;
    const adminDetails = getAdminDetailsFromToken(req);
    if (!adminDetails?.companyId || !subsite_id)
      return res.status(401).json({ message: "Missing company or sub-site ID" });

    const { sensorTable } = getSubsiteSensorTables(adminDetails.companyId, subsite_id);
    const [sensors] = await db.execute(`SELECT * FROM ${sensorTable}`);
    res.status(200).json({ sensors });
  } catch (error) {
    console.error("❌ Error fetching subsite sensors:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const deleteSubSiteSensor = async (req, res) => {
  try {
    const { id } = req.params;
    const { subsite_id } = req.body;

    const adminDetails = getAdminDetailsFromToken(req);
    if (!adminDetails?.companyId || !subsite_id)
      return res.status(401).json({ message: "Missing company or sub-site info" });

    const { sensorTable, activeTable, apiTable } = getSubsiteSensorTables(adminDetails.companyId, subsite_id);

    const [activeRows] = await db.execute(
      `SELECT * FROM ${activeTable} WHERE bank_id = ?`,
      [id]
    );

    if (activeRows.length > 0)
      return res.status(400).json({ message: "Sensor is active. Unassign it first." });

    await db.execute(`DELETE FROM ${apiTable} WHERE sensor_id = ?`, [id]);
    await db.execute(`DELETE FROM ${sensorTable} WHERE id = ?`, [id]);

    res.status(200).json({ message: "Sensor and its API mapping deleted" });
  } catch (error) {
    console.error("❌ Error deleting subsite sensor:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = {
  addSubSiteSensor,
  getAllSubSiteSensors,
  deleteSubSiteSensor
};
