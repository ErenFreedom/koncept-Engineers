const axios = require("axios");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const jwt = require("jsonwebtoken");

// ✅ Database Path
const dbPath = path.resolve(__dirname, "../db/localDB.sqlite");
console.log(`📌 Using Local Database: ${dbPath}`);

// ✅ Open Local Database
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) console.error("❌ Error opening database:", err.message);
    else console.log("✅ Connected to Local SQLite Database.");
});

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

/** ✅ Function to Fetch Company ID from JWT */
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

/** ✅ Fetch & Store Sensor Data */
const fetchAndStoreSensorData = async (sensor, companyId) => {
    try {
        const { sensor_id, api_endpoint, interval_seconds } = sensor;

        console.log(`📤 Fetching data from Desigo CC: ${api_endpoint}`);

        const response = await axios.get(api_endpoint);

        if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
            console.error("❌ Invalid sensor API response format.");
            return;
        }

        const sensorData = response.data[0]; // Assuming single object response

        // ✅ Extract Required Values
        const { Value, Quality, QualityGood, Timestamp } = sensorData.Value;
        console.log(`✅ Sensor ${sensor_id} Data: Value=${Value}, Quality=${Quality}, Timestamp=${Timestamp}`);

        // ✅ Get the correct table name using companyId
        const tableName = `SensorData_${companyId}_${sensor_id}`;
        console.log(`📌 Storing data in table: ${tableName}`);

        const insertQuery = `
            INSERT INTO ${tableName} (sensor_id, value, quality, quality_good, timestamp)
            VALUES (?, ?, ?, ?, ?);
        `;

        db.run(insertQuery, [sensor_id, Value, Quality, QualityGood, Timestamp], (err) => {
            if (err) {
                console.error(`❌ Error inserting data into ${tableName}:`, err.message);
            } else {
                console.log(`✅ Data stored successfully in ${tableName}`);
            }
        });

    } catch (error) {
        console.error(`❌ Error fetching data from Desigo CC: ${error.message}`);
    }
};

/** ✅ Process Data Based on API & Sensor ID */
const processSensorByAPI = async (req, res) => {
    try {
        const { api_endpoint, sensor_id } = req.query;

        if (!api_endpoint || !sensor_id) {
            return res.status(400).json({ message: "API Endpoint and Sensor ID are required." });
        }

        console.log(`🔍 Checking API: ${api_endpoint} and Sensor ID: ${sensor_id}`);

        // ✅ Fetch companyId from JWT
        let companyId;
        try {
            companyId = await getCompanyIdFromToken();
        } catch (error) {
            return res.status(401).json({ message: "Unauthorized: Failed to fetch company ID" });
        }

        // ✅ Step 1: Check if API exists in LocalSensorAPIs
        db.get(
            `SELECT api_endpoint FROM LocalSensorAPIs WHERE api_endpoint = ?`,
            [api_endpoint],
            async (err, row) => {
                if (err) {
                    console.error("❌ Error fetching API details:", err.message);
                    return res.status(500).json({ message: "Database error while fetching API." });
                }

                if (!row) {
                    return res.status(404).json({ message: "API endpoint not found in LocalSensorAPIs." });
                }

                console.log(`✅ API exists in LocalSensorAPIs: ${api_endpoint}`);

                // ✅ Step 2: Verify if sensor_id is active in LocalActiveSensors
                db.get(
                    `SELECT bank_id, interval_seconds, is_active FROM LocalActiveSensors WHERE bank_id = ? AND is_active = 1`,
                    [sensor_id],
                    async (err, sensor) => {
                        if (err) {
                            console.error("❌ Error fetching sensor details:", err.message);
                            return res.status(500).json({ message: "Failed to fetch sensor details" });
                        }

                        if (!sensor) {
                            return res.status(404).json({ message: "Sensor ID is not active or does not exist in LocalActiveSensors." });
                        }

                        const { bank_id, interval_seconds, is_active } = sensor;

                        if (is_active !== 1) {
                            return res.status(403).json({ message: "Sensor is not active." });
                        }

                        console.log(`✅ Found Active Sensor: ID ${bank_id}, Interval ${interval_seconds}s, CompanyID ${companyId}`);

                        // ✅ Start fetching data based on interval
                        setInterval(() => {
                            fetchAndStoreSensorData(
                                { sensor_id: bank_id, api_endpoint, interval_seconds },
                                companyId
                            );
                        }, interval_seconds * 1000);

                        res.status(200).json({
                            message: "Fetching started for sensor",
                            sensor_id: bank_id,
                            companyId,
                            interval_seconds,
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error("❌ Error processing request:", error.message);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

/** ✅ Export Function */
module.exports = { processSensorByAPI };
