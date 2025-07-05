const db = require("../db/connector");
const jwt = require("jsonwebtoken");

const getCompanyIdFromToken = (req) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return null;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.companyId;
    } catch (err) {
        console.error("❌ Error decoding JWT:", err.message);
        return null;
    }
};

const getActiveSensorDataMainSite = async (req, res) => {
    try {
        const companyId = getCompanyIdFromToken(req);
        if (!companyId) return res.status(401).json({ message: "Unauthorized: Invalid token" });

        const [activeSensors] = await db.execute(`SELECT * FROM Sensor_${companyId} WHERE is_active = 1`);
        if (!activeSensors.length) return res.status(200).json({ sensors: [] });

        const result = [];

        for (const sensor of activeSensors) {
            const { bank_id } = sensor;

            const [[details]] = await db.execute(
                `SELECT name, description, data_type, object_id, property_name
                 FROM SensorBank_${companyId} WHERE id = ?`, [bank_id]
            );
            if (!details) continue;

            const dataTable = `SensorData_${companyId}_${bank_id}`;
            let latest = null;
            try {
                const [rows] = await db.execute(`
                    SELECT value, quality, quality_good, timestamp
                    FROM ${dataTable}
                    ORDER BY timestamp DESC LIMIT 1
                `);
                latest = rows[0] || null;
            } catch {
                console.warn(`⚠️ Table ${dataTable} not found.`);
            }

            result.push({
                bank_id,
                name: details.name,
                description: details.description,
                data_type: details.data_type,
                object_id: details.object_id,
                property_name: details.property_name,
                value: latest?.value ? parseFloat(latest.value).toFixed(2) : "N/A",
                quality: latest?.quality || "N/A",
                quality_good: latest?.quality_good ?? null,
                timestamp: latest?.timestamp
                    ? new Date(latest.timestamp).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        hour12: true,
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit", second: "2-digit"
                    })
                    : "N/A",
            });
        }

        res.status(200).json({ sensors: result });
    } catch (err) {
        console.error("❌ Error fetching main site sensor data:", err.message);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

const getActiveSensorDataSubSite = async (req, res) => {
    try {
        const companyId = getCompanyIdFromToken(req);
        const subsiteId = req.query.subsite_id || req.query.subsiteId;
        if (!companyId || !subsiteId) return res.status(401).json({ message: "Unauthorized or missing subsite ID" });

        const [activeSensors] = await db.execute(`SELECT * FROM Sensor_${companyId}_${subsiteId} WHERE is_active = 1`);
        if (!activeSensors.length) return res.status(200).json({ sensors: [] });

        const result = [];

        for (const sensor of activeSensors) {
            const { bank_id } = sensor;

            const [[details]] = await db.execute(
                `SELECT name, description, data_type, object_id, property_name
                 FROM SensorBank_${companyId}_${subsiteId} WHERE id = ?`, [bank_id]
            );
            if (!details) continue;

            const dataTable = `SensorData_${companyId}_${subsiteId}_${bank_id}`;
            let latest = null;
            try {
                const [rows] = await db.execute(`
                    SELECT value, quality, quality_good, timestamp
                    FROM ${dataTable}
                    ORDER BY timestamp DESC LIMIT 1
                `);
                latest = rows[0] || null;
            } catch {
                console.warn(`⚠️ Table ${dataTable} not found.`);
            }

            result.push({
                bank_id,
                name: details.name,
                description: details.description,
                data_type: details.data_type,
                object_id: details.object_id,
                property_name: details.property_name,
                value: latest?.value ? parseFloat(latest.value).toFixed(2) : "N/A",
                quality: latest?.quality || "N/A",
                quality_good: latest?.quality_good ?? null,
                timestamp: latest?.timestamp
                    ? new Date(latest.timestamp).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        hour12: true,
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit", second: "2-digit"
                    })
                    : "N/A",
            });
        }

        res.status(200).json({ sensors: result });
    } catch (err) {
        console.error("❌ Error fetching subsite sensor data:", err.message);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

module.exports = { getActiveSensorDataMainSite, getActiveSensorDataSubSite };
