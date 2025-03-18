const axios = require("axios");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// ✅ Local Database Path
const dbPath = path.resolve(__dirname, "../db/localDB.sqlite");
console.log(`📌 Using database path: ${dbPath}`);

// ✅ Open Local Database
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) console.error("❌ Error opening database:", err.message);
    else console.log("✅ Connected to Local SQLite Database.");
});

/** ✅ Fetch Latest Token from Local DB */
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

/** ✅ Fetch Company ID from JWT */
const getCompanyIdFromToken = async () => {
    try {
        const token = await getStoredToken();
        const decoded = jwt.verify(token, process.env.JWT_SECRET_APP);
        console.log(`🔍 Extracted companyId: ${decoded.companyId}`);
        return decoded.companyId;
    } catch (error) {
        console.error("❌ Error decoding JWT:", error.message);
        throw new Error("Invalid token");
    }
};

/** ✅ Fetch Sensor Data from Local DB and Send to Cloud */
const sendDataToCloud = async (sensor_id) => {
    try {
        // ✅ Fetch company ID
        const companyId = await getCompanyIdFromToken();
        const tableName = `SensorData_${companyId}_${sensor_id}`;
        console.log(`📤 Preparing to send data from table: ${tableName}`);

        // ✅ Fetch `interval_seconds` and `batch_size` for the sensor
        const sensorQuery = `
            SELECT interval_seconds, batch_size 
            FROM LocalActiveSensors 
            WHERE bank_id = ? AND is_active = 1;
        `;

        db.get(sensorQuery, [sensor_id], async (err, sensorConfig) => {
            if (err || !sensorConfig) {
                console.error(`❌ Sensor ${sensor_id} not found in LocalActiveSensors or is inactive.`);
                return;
            }

            const { interval_seconds, batch_size } = sensorConfig;
            console.log(`⏳ Sending data every ${interval_seconds}s in batches of ${batch_size} records.`);

            // ✅ Function to fetch and send data in batches
            const sendBatch = async () => {
                db.all(`SELECT * FROM ${tableName} WHERE sent_to_cloud = 0 ORDER BY timestamp ASC LIMIT ?`, 
                    [batch_size], async (err, rows) => {
                    if (err) {
                        console.error(`❌ Error fetching data from ${tableName}:`, err.message);
                        return;
                    }

                    if (rows.length === 0) {
                        console.log(`⚠ No new data available for Sensor ${sensor_id}. Keeping connection alive.`);
                        return;
                    }

                    console.log(`📤 Sending ${rows.length} records to cloud for Sensor ${sensor_id}`);

                    try {
                        const cloudResponse = await axios.post(`${process.env.CLOUD_API_URL}/api/sensor-data/receive`, {
                            companyId,
                            sensorId: sensor_id,
                            data: rows
                        }, {
                            headers: { Authorization: `Bearer ${await getStoredToken()}` }
                        });

                        console.log("✅ Data sent to Cloud successfully:", cloudResponse.data);

                        // ✅ Mark sent data as `sent_to_cloud = 1`
                        const updateQuery = `UPDATE ${tableName} SET sent_to_cloud = 1 WHERE id IN (${rows.map(row => row.id).join(",")})`;
                        db.run(updateQuery, (err) => {
                            if (err) console.error(`❌ Error updating sent status in ${tableName}:`, err.message);
                            else console.log(`✅ Marked ${rows.length} records as sent.`);
                        });

                    } catch (error) {
                        console.error(`❌ Error sending data to Cloud: ${error.response?.data || error.message}`);
                    }
                });
            };

            // ✅ Run the batch sending at the specified interval
            setInterval(sendBatch, interval_seconds * 1000);

        });

    } catch (error) {
        console.error("❌ Error processing request:", error.message);
    }
};

/** ✅ Controller to Trigger Sending Data */
const triggerSendSensorData = async (req, res) => {
    try {
        const { sensor_id } = req.query;
        if (!sensor_id) {
            return res.status(400).json({ message: "Sensor ID is required." });
        }

        console.log(`🚀 Starting data sending process for Sensor ID: ${sensor_id}`);
        sendDataToCloud(sensor_id);

        res.status(200).json({ message: `Data sending started for Sensor ID ${sensor_id}` });

    } catch (error) {
        console.error("❌ Error in sending sensor data:", error.message);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

/** ✅ Export Functions */
module.exports = { triggerSendSensorData };
