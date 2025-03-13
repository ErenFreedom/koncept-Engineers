const db = require("../db/connector");
const jwt = require("jsonwebtoken");

/** ✅ Extract Admin Details from Token */
const getAdminDetailsFromToken = (req) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer Token
        if (!token) return null;
        return jwt.verify(token, process.env.JWT_SECRET_APP); // Decode JWT
    } catch (error) {
        console.error("❌ Error decoding JWT:", error.message);
        return null;
    }
};

/** ✅ Activate Sensor */
const activateSensor = async (req, res) => {
    try {
        const { sensorId } = req.body;

        // ✅ Validate Token & Get Admin ID
        const adminDetails = getAdminDetailsFromToken(req);
        if (!adminDetails) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }
        const companyId = adminDetails.company_id; // 🔹 Extract company ID from token

        // ✅ Verify if Sensor Exists in Sensor Bank
        const [sensorExists] = await db.execute(`SELECT * FROM SensorBank_${companyId} WHERE id = ?`, [sensorId]);
        if (sensorExists.length === 0) {
            return res.status(404).json({ message: "Sensor not found in Sensor Bank" });
        }

        // ✅ Push to Active Sensors Table
        await db.execute(`INSERT INTO Sensor_${companyId} (bank_id) VALUES (?)`, [sensorId]);

        console.log(`✅ Sensor ${sensorId} activated for Company ${companyId}`);
        res.status(200).json({ message: `Sensor ${sensorId} activated successfully` });
    } catch (error) {
        console.error("❌ Error activating sensor:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

/** ✅ Deactivate Sensor (Update `is_active` field) */
const deactivateSensor = async (req, res) => {
    try {
        const { sensorId } = req.body;

        // ✅ Validate Token & Get Admin ID
        const adminDetails = getAdminDetailsFromToken(req);
        if (!adminDetails) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }
        const companyId = adminDetails.company_id;

        // ✅ Check if Sensor is Active
        const [sensor] = await db.execute(`SELECT * FROM Sensor_${companyId} WHERE bank_id = ?`, [sensorId]);
        if (sensor.length === 0) {
            return res.status(404).json({ message: "Sensor is not active" });
        }

        // ✅ Set `is_active` to false
        await db.execute(`UPDATE Sensor_${companyId} SET is_active = 0 WHERE bank_id = ?`, [sensorId]);

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

        // ✅ Validate Token & Get Admin ID
        const adminDetails = getAdminDetailsFromToken(req);
        if (!adminDetails) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }
        const companyId = adminDetails.company_id;

        // ✅ Check if Sensor is Active
        const [sensor] = await db.execute(`SELECT * FROM Sensor_${companyId} WHERE bank_id = ?`, [sensorId]);
        if (sensor.length === 0) {
            return res.status(404).json({ message: "Sensor is not active" });
        }

        // ✅ Remove the sensor from Active Sensors Table
        await db.execute(`DELETE FROM Sensor_${companyId} WHERE bank_id = ?`, [sensorId]);

        console.log(`✅ Sensor ${sensorId} removed from active sensors for Company ${companyId}`);
        res.status(200).json({ message: `Sensor ${sensorId} removed successfully` });
    } catch (error) {
        console.error("❌ Error removing sensor:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

/** ✅ Export All Functions */
module.exports = { activateSensor, deactivateSensor, removeActiveSensor };
