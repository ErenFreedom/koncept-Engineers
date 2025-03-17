const db = require("../db/connector");
const jwt = require("jsonwebtoken");

/** ✅ Extract Admin Details from Token */
const getAdminDetailsFromToken = (req) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer Token
        if (!token) return null;

        const decoded = jwt.verify(token, process.env.JWT_SECRET_APP); // Decode JWT

        console.log("🔍 Extracted Admin Details from Token:", decoded);

        // Ensure companyId exists in either format
        const companyId = decoded.companyId || decoded.company_id;

        if (!companyId) {
            console.error("❌ Error: companyId is undefined in JWT", decoded);
            return null;
        }

        return { companyId, adminId: decoded.adminId }; // Return companyId and adminId
    } catch (error) {
        console.error("❌ Error decoding JWT:", error.message);
        return null;
    }
};

/** ✅ Activate Sensor */
const activateSensor = async (req, res) => {
    try {
        const { sensorId } = req.body;

        if (!sensorId) {
            return res.status(400).json({ message: "Sensor ID is required" });
        }

        // ✅ Validate Token & Get Admin ID
        const adminDetails = getAdminDetailsFromToken(req);
        if (!adminDetails) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }
        const { companyId } = adminDetails;

        console.log(`🔍 Activating Sensor ${sensorId} for Company ${companyId}`);

        // ✅ Verify if Sensor Exists in Sensor Bank
        const [sensorExists] = await db.execute(
            `SELECT * FROM SensorBank_${companyId} WHERE id = ?`, 
            [sensorId]
        );

        if (sensorExists.length === 0) {
            return res.status(404).json({ message: "Sensor not found in Sensor Bank" });
        }

        // ✅ Push to Active Sensors Table
        await db.execute(
            `INSERT INTO Sensor_${companyId} (bank_id, is_active) VALUES (?, 1)`, 
            [sensorId]
        );

        console.log(`✅ Sensor ${sensorId} activated for Company ${companyId}`);

        // ✅ Create Sensor Data Table for this sensor in Cloud DB
        const sensorTableName = `SensorData_${companyId}_${sensorId}`;
        console.log(`📌 Creating Sensor Data Table: ${sensorTableName}`);

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS ${sensorTableName} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sensor_id INT NOT NULL,
                value VARCHAR(255),
                quality VARCHAR(255),
                quality_good BOOLEAN,
                timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sensor_id) REFERENCES Sensor_${companyId}(bank_id) ON DELETE CASCADE
            )
        `;

        try {
            await db.execute(createTableQuery);
            console.log(`✅ Table ${sensorTableName} created successfully in Cloud DB.`);
        } catch (error) {
            console.error("❌ Error creating SensorData table in Cloud DB:", error.message);
            return res.status(500).json({ message: "Failed to create sensor data table in Cloud DB" });
        }

        res.status(200).json({ message: `Sensor ${sensorId} activated and table created successfully` });
    } catch (error) {
        console.error("❌ Error activating sensor:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

/** ✅ Deactivate Sensor (Update `is_active` field) */
const deactivateSensor = async (req, res) => {
    try {
        const { sensorId } = req.body;

        if (!sensorId) {
            return res.status(400).json({ message: "Sensor ID is required" });
        }

        // ✅ Validate Token & Get Admin ID
        const adminDetails = getAdminDetailsFromToken(req);
        if (!adminDetails) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }
        const { companyId } = adminDetails;

        console.log(`🔍 Deactivating Sensor ${sensorId} for Company ${companyId}`);

        // ✅ Check if Sensor is Active
        const [sensor] = await db.execute(
            `SELECT * FROM Sensor_${companyId} WHERE bank_id = ?`, 
            [sensorId]
        );

        if (sensor.length === 0) {
            return res.status(404).json({ message: "Sensor is not active" });
        }

        // ✅ Set `is_active` to false
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

/** ✅ Remove Sensor from Active Sensors */
const removeActiveSensor = async (req, res) => {
    try {
        const { sensorId } = req.body;

        if (!sensorId) {
            return res.status(400).json({ message: "Sensor ID is required" });
        }

        // ✅ Validate Token & Get Admin ID
        const adminDetails = getAdminDetailsFromToken(req);
        if (!adminDetails) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }
        const { companyId } = adminDetails;

        console.log(`🔍 Removing Sensor ${sensorId} from Active Sensors for Company ${companyId}`);

        // ✅ Check if Sensor Exists and is Deactivated (`is_active = 0`)
        const [sensor] = await db.execute(
            `SELECT * FROM Sensor_${companyId} WHERE bank_id = ?`, 
            [sensorId]
        );

        if (sensor.length === 0) {
            return res.status(404).json({ message: "Sensor not found in Active Sensors" });
        }

        if (sensor[0].is_active === 1) {
            return res.status(400).json({ message: "Sensor must be deactivated before removal" });
        }

        // ✅ Remove the sensor from Active Sensors Table
        await db.execute(
            `DELETE FROM Sensor_${companyId} WHERE bank_id = ?`, 
            [sensorId]
        );

        console.log(`✅ Sensor ${sensorId} removed from active sensors for Company ${companyId}`);

        // ✅ Drop the corresponding SensorData Table
        const sensorTableName = `SensorData_${companyId}_${sensorId}`;
        console.log(`🗑 Dropping Sensor Data Table: ${sensorTableName}`);

        const dropTableQuery = `DROP TABLE IF EXISTS ${sensorTableName}`;

        try {
            await db.execute(dropTableQuery);
            console.log(`✅ Table ${sensorTableName} dropped successfully from Cloud DB.`);
        } catch (error) {
            console.error(`❌ Error dropping table ${sensorTableName} in Cloud DB:`, error.message);
            return res.status(500).json({ message: "Failed to drop sensor data table in Cloud DB" });
        }

        res.status(200).json({ message: `Sensor ${sensorId} removed and table dropped successfully` });
    } catch (error) {
        console.error("❌ Error removing sensor:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

/** ✅ Export All Functions */
module.exports = { activateSensor, deactivateSensor, removeActiveSensor };
