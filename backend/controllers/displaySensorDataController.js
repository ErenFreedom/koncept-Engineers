const db = require("../db/connector");
const jwt = require("jsonwebtoken");

/** ✅ Extract Company ID from Admin JWT */
const getCompanyIdFromToken = (req) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return null;
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // ✅ Correct secret
        console.log("🔍 Decoded companyId from admin JWT:", decoded.companyId);
        return decoded.companyId;
    } catch (err) {
        console.error("❌ Error decoding admin JWT:", err.message);
        return null;
    }
};

/** ✅ Main Controller: Get Active Sensor Info + Latest Data */
const getActiveSensorData = async (req, res) => {
    try {
        const companyId = getCompanyIdFromToken(req);
        if (!companyId) return res.status(401).json({ message: "Unauthorized: Invalid token" });

        // ✅ Fetch all active sensors from Sensor_{companyId} table
        const [activeSensors] = await db.execute(`SELECT * FROM Sensor_${companyId} WHERE is_active = 1`);

        if (!activeSensors.length) return res.status(200).json({ sensors: [] });

        const sensorDataWithNames = [];

        for (const sensor of activeSensors) {
            const { bank_id } = sensor;

            // ✅ Fetch sensor details from SensorBank
            const [[sensorDetails]] = await db.execute(
                `SELECT name, description, data_type, object_id, property_name 
                 FROM SensorBank_${companyId} 
                 WHERE id = ?`,
                [bank_id]
            );

            if (!sensorDetails) continue; // skip if not found

            // ✅ Try to fetch latest sensor data from SensorData table
            const tableName = `SensorData_${companyId}_${bank_id}`;
            let latestData = null;

            try {
                const [rows] = await db.execute(`
                    SELECT value, quality, quality_good, timestamp
                    FROM ${tableName}
                    ORDER BY timestamp DESC
                    LIMIT 1
                `);
                latestData = rows[0] || null;
            } catch (tableErr) {
                console.warn(`⚠️ Table ${tableName} not found. Skipping data fetch.`);
            }

            sensorDataWithNames.push({
                bank_id,
                name: sensorDetails.name,
                description: sensorDetails.description,
                data_type: sensorDetails.data_type,
                object_id: sensorDetails.object_id,
                property_name: sensorDetails.property_name,
                value: latestData?.value || "N/A",
                quality: latestData?.quality || "N/A",
                quality_good: latestData?.quality_good ?? null,
                timestamp: latestData?.timestamp || "N/A",
            });
        }

        res.status(200).json({ sensors: sensorDataWithNames });

    } catch (err) {
        console.error("❌ Error fetching sensor data:", err.message);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

module.exports = { getActiveSensorData };
