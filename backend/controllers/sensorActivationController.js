const db = require("../db/connector");
const jwt = require("jsonwebtoken");


const getAdminDetailsFromToken = (req) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; 
        if (!token) return null;

        const decoded = jwt.verify(token, process.env.JWT_SECRET_APP); 

        console.log("🔍 Extracted Admin Details from Token:", decoded);

        
        const companyId = decoded.companyId || decoded.company_id;

        if (!companyId) {
            console.error("❌ Error: companyId is undefined in JWT", decoded);
            return null;
        }

        return { companyId, adminId: decoded.adminId }; 
    } catch (error) {
        console.error("❌ Error decoding JWT:", error.message);
        return null;
    }
};


const activateSensor = async (req, res) => {
    try {
        const { sensorId } = req.body;

        if (!sensorId) {
            return res.status(400).json({ message: "Sensor ID is required" });
        }

        
        const adminDetails = getAdminDetailsFromToken(req);
        if (!adminDetails) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }
        const { companyId } = adminDetails;

        console.log(`🔍 Activating Sensor ${sensorId} for Company ${companyId}`);

        const sensorTable = `Sensor_${companyId}`;
        const sensorBankTable = `SensorBank_${companyId}`;

        
        const [sensorExists] = await db.execute(
            `SELECT * FROM ${sensorBankTable} WHERE id = ?`,
            [sensorId]
        );

        if (sensorExists.length === 0) {
            return res.status(404).json({ message: "Sensor not found in Sensor Bank" });
        }

        
        const [alreadyActive] = await db.execute(
            `SELECT * FROM ${sensorTable} WHERE bank_id = ?`,
            [sensorId]
        );

        if (alreadyActive.length > 0) {
            return res.status(400).json({ message: "Sensor is already activated" });
        }

        
        await db.execute(
            `INSERT INTO ${sensorTable} (bank_id, is_active) VALUES (?, 1)`,
            [sensorId]
        );

        console.log(`✅ Sensor ${sensorId} activated for Company ${companyId}`);

        
        const sensorDataTable = `SensorData_${companyId}_${sensorId}`;
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS ${sensorDataTable} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sensor_id INT NOT NULL,
                value VARCHAR(255),
                quality VARCHAR(255),
                quality_good BOOLEAN,
                timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sensor_id) REFERENCES ${sensorTable}(bank_id) ON DELETE CASCADE
            )
        `;

        await db.execute(createTableQuery);
        console.log(`✅ Table ${sensorDataTable} created.`);

        res.status(200).json({ message: `Sensor ${sensorId} activated successfully` });

    } catch (error) {
        console.error("❌ Error activating sensor:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};



const deactivateSensor = async (req, res) => {
    try {
        const { sensorId } = req.body;

        if (!sensorId) {
            return res.status(400).json({ message: "Sensor ID is required" });
        }

        
        const adminDetails = getAdminDetailsFromToken(req);
        if (!adminDetails) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }
        const { companyId } = adminDetails;

        console.log(`🔍 Deactivating Sensor ${sensorId} for Company ${companyId}`);

        
        const [sensor] = await db.execute(
            `SELECT * FROM Sensor_${companyId} WHERE bank_id = ?`, 
            [sensorId]
        );

        if (sensor.length === 0) {
            return res.status(404).json({ message: "Sensor is not active" });
        }

        
        await db.execute(
            `UPDATE Sensor_${companyId} SET is_active = 0 WHERE bank_id = ?`, 
            [sensorId]
        );

        console.log(`✅ Sensor ${sensorId} deactivated for Company ${companyId}`);
        res.status(200).json({ message: `Sensor ${sensorId} deactivated successfully` });
    } catch (error) {
        console.error("❌ Error deactivating sensor:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


const removeActiveSensor = async (req, res) => {
    try {
        const { sensorId } = req.body;

        if (!sensorId) {
            return res.status(400).json({ message: "Sensor ID is required" });
        }

        const adminDetails = getAdminDetailsFromToken(req);
        if (!adminDetails) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }

        const { companyId } = adminDetails;
        const sensorTable = `Sensor_${companyId}`;
        const sensorDataTable = `SensorData_${companyId}_${sensorId}`;

        console.log(`🔍 Checking sensor ${sensorId} in ${sensorTable}`);

        const [sensor] = await db.execute(
            `SELECT * FROM ${sensorTable} WHERE bank_id = ?`,
            [sensorId]
        );

        if (sensor.length === 0) {
            return res.status(404).json({ message: "Sensor not found in Active Sensors" });
        }

        if (sensor[0].is_active === 1) {
            return res.status(400).json({ message: "Sensor must be deactivated before removal" });
        }

        
        await db.execute(
            `DELETE FROM ${sensorTable} WHERE bank_id = ?`,
            [sensorId]
        );
        console.log(`✅ Sensor ${sensorId} deleted from ${sensorTable}`);

        
        try {
            await db.execute(`DROP TABLE IF EXISTS ${sensorDataTable}`);
            console.log(`🗑 Table ${sensorDataTable} dropped successfully.`);
        } catch (dropErr) {
            console.error(`❌ Error dropping table ${sensorDataTable}:`, dropErr.message);
            return res.status(500).json({ message: "Failed to drop sensor data table", error: dropErr.message });
        }

        res.status(200).json({ message: `Sensor ${sensorId} removed and table dropped successfully` });

    } catch (error) {
        console.error("❌ Error in removeActiveSensor:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


const getAllActiveSensors = async (req, res) => {
    try {
      const adminDetails = getAdminDetailsFromToken(req);
      if (!adminDetails) {
        return res.status(401).json({ message: "Unauthorized: Invalid or missing token" });
      }
  
      const { companyId } = adminDetails;
      const sensorTable = `Sensor_${companyId}`;
      const sensorBankTable = `SensorBank_${companyId}`;
  
      const [sensors] = await db.execute(`
        SELECT s.*, b.name 
        FROM ${sensorTable} s
        JOIN ${sensorBankTable} b ON s.bank_id = b.id
      `);
  
      res.status(200).json({ sensors });
    } catch (error) {
      console.error("❌ Error fetching active sensors with names:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  };
  
  

const getAllManagedSensors = async (req, res) => {
    try {
      const adminDetails = getAdminDetailsFromToken(req);
      if (!adminDetails) {
        return res.status(401).json({ message: "Unauthorized: Invalid or missing token" });
      }
  
      const { companyId } = adminDetails;
      const sensorTable = `Sensor_${companyId}`;
  
      
      const [sensors] = await db.execute(`SELECT * FROM ${sensorTable}`);
  
      res.status(200).json({ sensors });
    } catch (error) {
      console.error("❌ Error fetching managed sensors:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  };

  
const reactivateSensor = async (req, res) => {
    try {
        const { sensorId } = req.body;

        if (!sensorId) {
            return res.status(400).json({ message: "Sensor ID is required" });
        }

        const adminDetails = getAdminDetailsFromToken(req);
        if (!adminDetails) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }

        const { companyId } = adminDetails;
        const sensorTable = `Sensor_${companyId}`;

        console.log(`🔄 Reactivating Sensor ${sensorId} for Company ${companyId}`);

        
        const [sensor] = await db.execute(
            `SELECT * FROM ${sensorTable} WHERE bank_id = ?`,
            [sensorId]
        );

        if (sensor.length === 0) {
            return res.status(404).json({ message: "Sensor not found in managed sensors" });
        }

        if (sensor[0].is_active === 1) {
            return res.status(400).json({ message: "Sensor is already active" });
        }

       
        await db.execute(
            `UPDATE ${sensorTable} SET is_active = 1 WHERE bank_id = ?`,
            [sensorId]
        );

        console.log(`✅ Sensor ${sensorId} reactivated successfully`);
        res.status(200).json({ message: `Sensor ${sensorId} reactivated successfully` });

    } catch (error) {
        console.error("❌ Error reactivating sensor:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};



module.exports = { activateSensor, deactivateSensor, removeActiveSensor, getAllActiveSensors,getAllManagedSensors, reactivateSensor };
