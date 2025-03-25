// File: controllers/displaySensorDataController.js

const db = require("../db/connector");
const jwt = require("jsonwebtoken");

// ✅ Extract Company ID from JWT
const getCompanyIdFromToken = (req) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return null;
        const decoded = jwt.verify(token, process.env.JWT_SECRET_APP);
        return decoded.companyId;
    } catch (err) {
        console.error("❌ Error decoding JWT:", err.message);
        return null;
    }
};

// ✅ Main controller to get active sensors with latest data
const getActiveSensorData = async (req, res) => {
    try {
        const companyId = getCompanyIdFromToken(req);
        if (!companyId) return res.status(401).json({ message: "Unauthorized: Invalid token" });

        // ✅ Get all active sensors from Sensor table
        const [activeSensors] = await db.execute(`SELECT * FROM Sensor_${companyId} WHERE is_active = 1`);

        if (!activeSensors.length) return res.status(200).json({ sensors: [] });

        const sensorDataWithNames = [];

        for (const sensor of activeSensors) {
            const { bank_id } = sensor;

            // ✅ Get sensor name and details from SensorBank
            const [[sensorDetails]] = await db.execute(
                `SELECT name, description, data_type, object_id, property_name FROM SensorBank_${companyId} WHERE id = ?`,
                [bank_id]
            );

            if (!sensorDetails) continue; // skip if missing

            // ✅ Fetch latest data from SensorData table (if exists)
            const tableName = `SensorData_${companyId}_${bank_id}`;
            const [latestData] = await db.execute(`
                SELECT value, quality, quality_good, timestamp
                FROM ${tableName}
                ORDER BY timestamp DESC
                LIMIT 1
            `).catch(() => [null]); // gracefully handle non-existing table

            sensorDataWithNames.push({
                bank_id,
                name: sensorDetails.name,
                description: sensorDetails.description,
                data_type: sensorDetails.data_type,
                object_id: sensorDetails.object_id,
                property_name: sensorDetails.property_name,
                latest_data: latestData?.[0] || null
            });
        }

        res.status(200).json({ sensors: sensorDataWithNames });
    } catch (err) {
        console.error("❌ Error fetching sensor data:", err.message);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

module.exports = { getActiveSensorData };
