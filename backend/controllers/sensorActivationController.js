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
        const { sensorApi } = req.body;

        if (!sensorApi) {
            return res.status(400).json({ message: "Sensor API is required" });
        }

        // ✅ Validate Token & Get Admin ID
        const adminDetails = getAdminDetailsFromToken(req);
        if (!adminDetails) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }
        const { companyId } = adminDetails;

        console.log(`🔍 Activating Sensor ${sensorApi} for Company ${companyId}`);

        // ✅ Push to Active Sensors Table
        await db.execute(
            `INSERT INTO Sensor_${companyId} (sensor_api, is_active) VALUES (?, 1) ON DUPLICATE KEY UPDATE is_active = 1`,
            [sensorApi]
        );

        console.log(`✅ Sensor ${sensorApi} activated for Company ${companyId}`);

        // ✅ Create Dynamic Table (Format: SensorData_CompanyId_SensorApi)
        const sensorTableName = `SensorData_${companyId}_${sensorApi.replace(/\W/g, "_")}`;
        console.log(`📌 Creating sensor data table: ${sensorTableName}`);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS ${sensorTableName} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sensor_api VARCHAR(255) NOT NULL,
                value TEXT NOT NULL,
                quality TEXT NOT NULL,
                quality_good BOOLEAN NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        res.status(200).json({ message: `Sensor ${sensorApi} activated successfully` });
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
        const { sensorApi } = req.body;
        if (!sensorApi) {
            return res.status(400).json({ message: "Sensor API is required" });
        }

        // ✅ Validate Token & Get Admin ID
        const adminDetails = getAdminDetailsFromToken(req);
        if (!adminDetails) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }
        const { companyId } = adminDetails;

        console.log(`📤 Removing Sensor ${sensorApi} from Active Sensors for Company ${companyId}`);

        // ✅ Remove the sensor from Active Sensors Table
        await db.execute(
            `DELETE FROM Sensor_${companyId} WHERE sensor_api = ?`,
            [sensorApi]
        );

        console.log(`✅ Sensor ${sensorApi} removed from Active Sensors for Company ${companyId}`);

        // ✅ Drop Dynamic Sensor Data Table
        const sensorTableName = `SensorData_${companyId}_${sensorApi.replace(/\W/g, "_")}`;
        console.log(`🗑 Dropping sensor data table: ${sensorTableName}`);

        await db.execute(`DROP TABLE IF EXISTS ${sensorTableName}`);

        res.status(200).json({ message: `Sensor ${sensorApi} removed successfully` });
    } catch (error) {
        console.error("❌ Error removing sensor:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

/** ✅ Export All Functions */
module.exports = { activateSensor, deactivateSensor, removeActiveSensor };
