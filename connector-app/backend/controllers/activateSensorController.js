const axios = require("axios");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const jwt = require("jsonwebtoken");
const { db, createSensorDataTable } = require("../db/sensorDB"); 


require("dotenv").config();

// ✅ Local Database Path
const dbPath = path.resolve(__dirname, "../db/localDB.sqlite");
console.log(`📌 Using database path: ${dbPath}`);

// ✅ Open Local Database


/** ✅ Function to Fetch Latest Token from Local DB */
const getStoredToken = () => {
    return new Promise((resolve, reject) => {
        db.get("SELECT token FROM AuthTokens ORDER BY id DESC LIMIT 1", [], (err, row) => {
            if (err) {
                console.error("❌ Error fetching token:", err.message);
                reject("Error fetching token from database");
            } else if (!row) {
                reject("No stored token found.");
            } else {
                resolve(row.token);
            }
        });
    });
};

const getCompanyIdFromToken = () => {
    return new Promise((resolve, reject) => {
        db.get("SELECT token FROM AuthTokens ORDER BY id DESC LIMIT 1", [], (err, row) => {
            if (err || !row) {
                console.error("❌ Error fetching token:", err?.message || "No token found");
                return reject("Error fetching token from database");
            }

            try {
                const decoded = jwt.verify(row.token, process.env.JWT_SECRET_APP);
                console.log(`🔍 Extracted companyId: ${decoded.companyId}`);
                resolve(decoded.companyId);
            } catch (error) {
                console.error("❌ Error decoding JWT:", error.message);
                reject("Invalid token");
            }
        });
    });
};


/** ✅ Activate Sensor (Connector Sends Request to Cloud + Updates Local DB) */
const activateSensor = async (req, res) => {
    try {
        const { sensorId, interval_seconds, batch_size } = req.body;
        if (!sensorId) return res.status(400).json({ message: "Sensor ID is required" });

        let companyId, sensorApi, token;
        try {
            companyId = await getCompanyIdFromToken();
            sensorApi = await getSensorApi(sensorId);
            token = await getStoredToken();
        } catch (error) {
            return res.status(401).json({ message: error });
        }

        // ✅ Set default values
        const interval = interval_seconds ?? 10;
        const batch = batch_size ?? 1;

        console.log(`📤 Activating Sensor in Cloud: ${sensorApi}`);

        try {
            const cloudApiUrl = `${process.env.CLOUD_API_URL}/api/sensors/activate`;
            const cloudResponse = await axios.post(cloudApiUrl, { sensorApi, companyId }, { 
                headers: { Authorization: `Bearer ${token}` } 
            });

            console.log("✅ Sensor activated successfully in Cloud:", cloudResponse.data);

            // ✅ Insert or update in Local DB
            db.run(
                `INSERT INTO LocalActiveSensors (bank_id, is_active, mode, interval_seconds, batch_size)
                 VALUES (?, 1, 'manual', ?, ?)
                 ON CONFLICT(bank_id) DO UPDATE SET 
                    is_active = 1, 
                    interval_seconds = excluded.interval_seconds,
                    batch_size = excluded.batch_size`,
                [sensorId, interval, batch],
                async (err) => {
                    if (err) console.error("❌ Error inserting into Local DB:", err.message);
                    else {
                        console.log(`✅ Sensor ${sensorApi} activated in Local DB.`);
                        // ✅ Create Dynamic Table (Format: SensorData_CompanyId_SensorApi)
                        const sensorTableName = `SensorData_${companyId}_${sensorApi.replace(/\W/g, "_")}`;
                        console.log(`📌 Creating sensor data table: ${sensorTableName}`);
                        await createSensorDataTable(sensorTableName);
                    }
                }
            );

            res.status(200).json({ 
                message: "Sensor activated successfully", 
                cloudResponse: cloudResponse.data
            });
        } catch (error) {
            res.status(500).json({ message: "Failed to activate sensor in Cloud", error: error.response?.data || error.message });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};





/** ✅ Deactivate Sensor (Connector Sends Request to Cloud + Updates Local DB) */
const deactivateSensor = async (req, res) => {
    try {
        const { sensorId } = req.body;
        if (!sensorId) {
            return res.status(400).json({ message: "Sensor ID is required" });
        }

        // ✅ Fetch stored JWT from local DB
        let token;
        try {
            token = await getStoredToken();
            console.log(`🔍 Using Token: ${token}`);
        } catch (error) {
            return res.status(401).json({ message: "Unauthorized: Token missing or invalid" });
        }

        // ✅ Send deactivation request to Cloud Backend
        const cloudApiUrl = `${process.env.CLOUD_API_URL}/api/sensors/deactivate`;
        console.log(`📤 Deactivating Sensor in Cloud: ${cloudApiUrl}`);

        try {
            const cloudResponse = await axios.post(cloudApiUrl, { sensorId }, { headers: { Authorization: `Bearer ${token}` } });
            console.log("✅ Sensor deactivated successfully in Cloud:", cloudResponse.data);

            // ✅ Update in Local DB (Set is_active = 0)
            db.run(
                `UPDATE LocalActiveSensors SET is_active = 0 WHERE bank_id = ?`,
                [sensorId],
                (err) => {
                    if (err) console.error("❌ Error updating Local DB:", err.message);
                    else console.log(`✅ Sensor ${sensorId} deactivated in Local DB.`);
                }
            );

            res.status(200).json({ message: "Sensor deactivated successfully", cloudResponse: cloudResponse.data });
        } catch (error) {
            console.error("❌ Failed to deactivate sensor in Cloud:", error.response?.data || error.message);
            res.status(500).json({ message: "Failed to deactivate sensor in Cloud", error: error.response?.data || error.message });
        }
    } catch (error) {
        console.error("❌ Error deactivating sensor:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

/** ✅ Remove Sensor (Connector Sends Request to Cloud + Deletes from Local DB) */
const removeActiveSensor = async (req, res) => {
    try {
        const { sensorId } = req.body;
        if (!sensorId) return res.status(400).json({ message: "Sensor ID is required" });

        let companyId, sensorApi, token;
        try {
            companyId = await getCompanyIdFromToken();
            sensorApi = await getSensorApi(sensorId);
            token = await getStoredToken();
        } catch (error) {
            return res.status(401).json({ message: error });
        }

        console.log(`📤 Removing Sensor from Cloud: ${sensorApi}`);

        try {
            const cloudApiUrl = `${process.env.CLOUD_API_URL}/api/sensors/remove`;
            const cloudResponse = await axios.post(cloudApiUrl, { sensorApi, companyId }, { 
                headers: { Authorization: `Bearer ${token}` } 
            });

            console.log("✅ Sensor removed successfully from Cloud:", cloudResponse.data);

            // ✅ Delete from Local DB
            db.run(`DELETE FROM LocalActiveSensors WHERE bank_id = ?`, [sensorId], (err) => {
                if (err) console.error("❌ Error deleting from Local DB:", err.message);
                else {
                    console.log(`✅ Sensor ${sensorApi} removed from Local DB.`);
                    // ✅ Drop Sensor Data Table
                    const sensorTableName = `SensorData_${companyId}_${sensorApi.replace(/\W/g, "_")}`;
                    console.log(`🗑 Dropping sensor data table: ${sensorTableName}`);
                    db.run(`DROP TABLE IF EXISTS ${sensorTableName}`, (dropErr) => {
                        if (dropErr) console.error(`❌ Error deleting table ${sensorTableName}:`, dropErr.message);
                        else console.log(`✅ Table ${sensorTableName} deleted.`);
                    });
                }
            });

            res.status(200).json({ message: "Sensor removed successfully", cloudResponse: cloudResponse.data });
        } catch (error) {
            res.status(500).json({ message: "Failed to remove sensor in Cloud", error: error.response?.data || error.message });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};




/** ✅ Export Functions */
module.exports = { activateSensor, deactivateSensor, removeActiveSensor };
