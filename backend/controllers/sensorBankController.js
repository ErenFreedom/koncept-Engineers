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

//The core logic resides here, 3 days for debugging can't believe lol

const addSensor = async (req, res) => {
    try {
        const { sensorName, description, objectId, propertyName, dataType } = req.body;

        
        const adminDetails = getAdminDetailsFromToken(req);
        if (!adminDetails) {
            return res.status(401).json({ message: "Unauthorized: Invalid or missing token" });
        }

        const { companyId } = adminDetails;
        const sensorTable = `SensorBank_${companyId}`;
        const apiTokenTable = `ApiToken_${companyId}`;

       
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

        
        await db.execute(
            `INSERT INTO ${sensorTable} (name, description, object_id, property_name, data_type, is_active)
             VALUES (?, ?, ?, ?, ?, 0)`,
            [sensorName, description, objectId, propertyName, dataType]
        );

        
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


const getAllSensors = async (req, res) => {
    try {
        
        const adminDetails = getAdminDetailsFromToken(req);
        if (!adminDetails) {
            return res.status(401).json({ message: "Unauthorized: Invalid or missing token" });
        }

        const { companyId } = adminDetails;
        const sensorTable = `SensorBank_${companyId}`;

       
        const [sensors] = await db.execute(`SELECT * FROM ${sensorTable}`);

        res.status(200).json({ sensors });

    } catch (error) {
        console.error("❌ Error fetching sensors:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


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
  
     
      const [activeRows] = await db.execute(
        `SELECT * FROM ${activeTable} WHERE bank_id = ?`,
        [id]
      );
  
      if (activeRows.length > 0) {
        return res.status(400).json({ message: "Sensor must be removed from active sensors first." });
      }
  
      
      await db.execute(`DELETE FROM ${sensorTable} WHERE id = ?`, [id]);
  
      res.status(200).json({ message: "Sensor deleted successfully from SensorBank." });
    } catch (error) {
      console.error("❌ Error deleting sensor:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  };
  
  

module.exports = { addSensor, getAllSensors, deleteSensor };
