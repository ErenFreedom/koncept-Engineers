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

// ✅ Create IntervalControl Table (referencing LocalSensorBank)
db.run(`
    CREATE TABLE IF NOT EXISTS IntervalControl (
        sensor_id INTEGER PRIMARY KEY,
        is_fetching INTEGER DEFAULT 0,
        is_sending INTEGER DEFAULT 0,
        FOREIGN KEY (sensor_id) REFERENCES LocalSensorBank(id) ON DELETE CASCADE
    )
`);

/** ✅ Fetch Latest Token from Local DB */
const getStoredToken = () => {
    return new Promise((resolve, reject) => {
        db.get("SELECT token FROM AuthTokens ORDER BY id DESC LIMIT 1", [], (err, row) => {
            if (err || !row) return reject("No valid token found.");
            resolve(row.token);
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
    } catch (err) {
        console.error("❌ JWT decode failed:", err.message);
        throw new Error("Invalid token");
    }
};

/** ✅ Send Sensor Data to Cloud */
const sendDataToCloud = async (sensor_id) => {
    try {
        const companyId = await getCompanyIdFromToken();
        const tableName = `SensorData_${companyId}_${sensor_id}`;

        const sensorQuery = `
            SELECT interval_seconds, batch_size 
            FROM LocalActiveSensors 
            WHERE bank_id = ? AND is_active = 1;
        `;

        db.get(sensorQuery, [sensor_id], async (err, sensorConfig) => {
            if (err || !sensorConfig) {
                console.error(`❌ Sensor ${sensor_id} not found or inactive.`);
                return;
            }

            const { interval_seconds, batch_size } = sensorConfig;

            // ✅ Update IntervalControl to mark is_sending = 1
            db.run(`
                INSERT INTO IntervalControl (sensor_id, is_sending)
                VALUES (?, 1)
                ON CONFLICT(sensor_id) DO UPDATE SET is_sending = 1;
            `, [sensor_id]);

            // ✅ Repeating task to send batch data
            const intervalFn = async () => {
                db.get(
                    `SELECT is_sending FROM IntervalControl WHERE sensor_id = ?`,
                    [sensor_id],
                    async (err, row) => {
                        if (err || !row || row.is_sending !== 1) return;

                        db.all(
                            `SELECT * FROM ${tableName} WHERE sent_to_cloud = 0 ORDER BY timestamp ASC LIMIT ?`,
                            [batch_size],
                            async (err, rows) => {
                                if (err || rows.length < batch_size) {
                                    console.log(`🕓 Waiting for full batch of ${batch_size}`);
                                    return;
                                }

                                try {
                                    const response = await axios.post(
                                        `${process.env.CLOUD_API_URL}/api/sensor-data/receive-data`,
                                        { companyId, sensorId: sensor_id, batch: rows },
                                        { headers: { Authorization: `Bearer ${await getStoredToken()}` } }
                                    );

                                    console.log("✅ Cloud response:", response.data);

                                    const ids = rows.map(row => row.id).join(",");
                                    db.run(`UPDATE ${tableName} SET sent_to_cloud = 1 WHERE id IN (${ids})`);
                                } catch (err) {
                                    console.error("❌ Cloud send error:", err.message);
                                }
                            }
                        );
                    }
                );
            };

            setInterval(intervalFn, interval_seconds * 1000);
            console.log(`🚀 Started cloud send interval for sensor ${sensor_id} every ${interval_seconds}s`);
        });
    } catch (err) {
        console.error("❌ sendDataToCloud error:", err.message);
    }
};

/** ✅ API to Trigger Sending */
const triggerSendSensorData = async (req, res) => {
    const { sensor_id } = req.query;
    if (!sensor_id) return res.status(400).json({ message: "Sensor ID is required." });

    sendDataToCloud(sensor_id);
    return res.status(200).json({ message: `Started sending data for sensor ${sensor_id}` });
};

/** ✅ API to Stop Sending */
const stopSendingToCloud = (req, res) => {
    const { sensor_id } = req.query;
    if (!sensor_id) return res.status(400).json({ message: "Sensor ID required to stop sending." });

    db.run(
        `UPDATE IntervalControl SET is_sending = 0, is_fetching = 0 WHERE sensor_id = ?
`,
        [sensor_id],
        function (err) {
            if (err) {
                console.error("❌ Failed to stop sending:", err.message);
                return res.status(500).json({ message: "Failed to stop sending." });
            }

            if (this.changes === 0) {
                return res.status(404).json({ message: `No active sending interval found for sensor ${sensor_id}` });
            }

            console.log(`🛑 Sending stopped for sensor ${sensor_id}`);
            return res.status(200).json({ message: `Stopped sending to cloud for sensor ${sensor_id}` });
        }
    );
};

module.exports = { triggerSendSensorData, stopSendingToCloud };
