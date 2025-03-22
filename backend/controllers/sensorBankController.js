const db = require("../db/connector");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/** ✅ Middleware: Extract Admin & Company ID from JWT */
const getAdminDetailsFromToken = (req) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer Token
        if (!token) return null;

        // ✅ Use JWT_SECRET_APP instead of JWT_SECRET
        return jwt.verify(token, process.env.JWT_SECRET_APP); // Decode JWT with the correct secret
    } catch (error) {
        console.error("❌ Error decoding JWT:", error.message);
        return null;
    }
};


/** ✅ Add a Sensor to the Correct `SensorBank_X` Table */
const addSensor = async (req, res) => {
    try {
        const { sensorName, description, objectId, propertyName, dataType } = req.body;

        // 🔹 Decode JWT to get `companyId`
        const adminDetails = getAdminDetailsFromToken(req);
        if (!adminDetails) {
            return res.status(401).json({ message: "Unauthorized: Invalid or missing token" });
        }

        const { companyId } = adminDetails;
        const sensorTable = `SensorBank_${companyId}`;
        const apiTokenTable = `ApiToken_${companyId}`;

        // ✅ Ensure `SensorBank_X` table exists
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

        // ✅ Insert Sensor into `SensorBank_X`
        await db.execute(
            `INSERT INTO ${sensorTable} (name, description, object_id, property_name, data_type, is_active)
             VALUES (?, ?, ?, ?, ?, 0)`,
            [sensorName, description, objectId, propertyName, dataType]
        );

        // ✅ Insert API Token into `ApiToken_X`
        await db.execute(`
            CREATE TABLE IF NOT EXISTS ${apiTokenTable} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                token TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        res.status(200).json({ message: `Sensor added successfully to ${sensorTable}` });

    } catch (error) {
        console.error("❌ Error adding sensor:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

/** ✅ Get All Sensors for a Company */
const getAllSensors = async (req, res) => {
    try {
        // 🔹 Decode JWT to get `companyId`
        const adminDetails = getAdminDetailsFromToken(req);
        if (!adminDetails) {
            return res.status(401).json({ message: "Unauthorized: Invalid or missing token" });
        }

        const { companyId } = adminDetails;
        const sensorTable = `SensorBank_${companyId}`;

        // ✅ Fetch all sensors
        const [sensors] = await db.execute(`SELECT * FROM ${sensorTable}`);

        res.status(200).json({ sensors });

    } catch (error) {
        console.error("❌ Error fetching sensors:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

/** ✅ Delete a Sensor */
const deleteSensor = async (req, res) => {
    try {
      const { id } = req.params;
  
      const adminDetails = getAdminDetailsFromToken(req);
      if (!adminDetails) {
        return res.status(401).json({ message: "Unauthorized: Invalid or missing token" });
      }
  
      const { companyId } = adminDetails;
      const sensorTable = `SensorBank_${companyId}`;
      const activeTable = `Sensor_${companyId}`;
  
      // ✅ Check if the sensor is active in `Sensor_X` table
      const [activeRows] = await db.execute(
        `SELECT * FROM ${activeTable} WHERE bank_id = ? AND is_active = 1`,
        [id]
      );
  
      if (activeRows.length > 0) {
        return res.status(400).json({ message: "Cannot delete an active sensor. Please deactivate it first." });
      }
  
      // ✅ Delete from SensorBank_X
      await db.execute(`DELETE FROM ${sensorTable} WHERE id = ?`, [id]);
  
      res.status(200).json({ message: "Sensor deleted successfully" });
  
    } catch (error) {
      console.error("❌ Error deleting sensor:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  };
  

module.exports = { addSensor, getAllSensors, deleteSensor };
