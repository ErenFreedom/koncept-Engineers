const db = require("../db/connector");
const jwt = require("jsonwebtoken");

/** ✅ Extract Company ID from Token */
const getCompanyIdFromToken = (req) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer Token
        if (!token) {
            console.error("❌ No token provided.");
            return null;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_APP); // Decode JWT
        console.log("🔍 Extracted Company ID from Token:", decoded.companyId);

        return decoded.companyId;
    } catch (error) {
        console.error("❌ Error decoding JWT:", error.message);
        return null;
    }
};

/** ✅ Check if Sensor Data Table Exists */
const checkIfSensorTableExists = async (companyId, sensorId) => {
    return new Promise((resolve, reject) => {
        const tableName = `SensorData_${companyId}_${sensorId}`;
        db.query(
            `SHOW TABLES LIKE ?`,
            [tableName],
            (err, results) => {
                if (err) {
                    console.error(`❌ Error checking if table exists:`, err.message);
                    return reject(err);
                }
                resolve(results.length > 0);
            }
        );
    });
};

/** ✅ Create Sensor Data Table if Not Exists */
const createSensorDataTable = async (companyId, sensorId) => {
    return new Promise((resolve, reject) => {
        const tableName = `SensorData_${companyId}_${sensorId}`;
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS ${tableName} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sensor_id INT NOT NULL,
                value VARCHAR(255) NOT NULL,
                quality VARCHAR(255) NOT NULL,
                quality_good BOOLEAN NOT NULL,
                timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                sent_to_cloud BOOLEAN DEFAULT 0
            );
        `;

        db.query(createTableQuery, (err) => {
            if (err) {
                console.error(`❌ Error creating table ${tableName}:`, err.message);
                return reject(err);
            }
            console.log(`✅ Table ${tableName} created (or already exists).`);
            resolve();
        });
    });
};

/** ✅ Insert Sensor Data into Cloud DB */
const insertSensorData = async (req, res) => {
    try {
        // ✅ Extract companyId from token
        const companyId = getCompanyIdFromToken(req);
        if (!companyId) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }

        const { sensorId, batch } = req.body;

        // ✅ Log Full Incoming Data
        console.log("🚀 Incoming Data to Backend:");
        console.log(JSON.stringify(req.body, null, 2));

        if (!sensorId || !batch || !Array.isArray(batch) || batch.length === 0) {
            console.error("❌ Invalid request data:", JSON.stringify(req.body, null, 2));
            return res.status(400).json({ message: "Sensor ID and batch data are required." });
        }

        console.log(`📤 Receiving batch data for Sensor ${sensorId}, Company ${companyId}`);

        // ✅ Check if table exists, else create
        const tableExists = await checkIfSensorTableExists(companyId, sensorId);
        if (!tableExists) {
            await createSensorDataTable(companyId, sensorId);
        }

        // ✅ Insert batch of data into SensorData table
        const tableName = `SensorData_${companyId}_${sensorId}`;
        const insertQuery = `
            INSERT INTO ${tableName} (sensor_id, value, quality, quality_good, timestamp)
            VALUES ?
        `;

        const values = batch.map(({ sensor_id, value, quality, quality_good, timestamp }) => [
            sensor_id,
            value,
            quality,
            quality_good,
            new Date(timestamp).toISOString().slice(0, 19).replace("T", " ") // Ensure MySQL DATETIME format
        ]);

        // **LOGGING TO DEBUG**
        console.log(`📝 SQL Query: ${insertQuery}`);
        console.log(`📋 Data to Insert:`, JSON.stringify(values, null, 2));

        db.query(insertQuery, [values], (err, result) => {
            if (err) {
                console.error(`❌ Error inserting batch data into ${tableName}:`, err.message);
                return res.status(500).json({ message: `Failed to insert batch data into ${tableName}`, error: err.message });
            }

            console.log(`✅ Successfully inserted ${batch.length} records into ${tableName}`);
            res.status(200).json({ message: "Data inserted successfully", inserted: batch.length });
        });
    } catch (error) {
        console.error("❌ Error processing sensor data:", error.message);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

/** ✅ Export Functions */
module.exports = { insertSensorData };
