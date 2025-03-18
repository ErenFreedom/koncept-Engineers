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
        console.log(`🔍 Checking if table ${tableName} exists...`);

        db.query(`SHOW TABLES LIKE ?`, [tableName], (err, results) => {
            if (err) {
                console.error(`❌ Error checking table ${tableName}:`, err.message);
                return reject(err);
            }
            if (results.length > 0) {
                console.log(`✅ Table ${tableName} exists.`);
                resolve(true);
            } else {
                console.warn(`⚠ Table ${tableName} does NOT exist.`);
                resolve(false);
            }
        });
    });
};

/** ✅ Insert Sensor Data into Cloud DB */
const insertSensorData = async (req, res) => {
    try {
        // ✅ Extract company ID from token
        const companyId = getCompanyIdFromToken(req);
        if (!companyId) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }

        const { sensorId, batch } = req.body;

        console.log("🚀 Incoming Data to Backend:");
        console.log(JSON.stringify(req.body, null, 2));

        if (!sensorId || !batch || !Array.isArray(batch) || batch.length === 0) {
            console.error("❌ Invalid request data:", JSON.stringify(req.body, null, 2));
            return res.status(400).json({ message: "Sensor ID and batch data are required." });
        }

        console.log(`📤 Receiving batch data for Sensor ${sensorId}, Company ${companyId}`);

        const tableName = `SensorData_${companyId}_${sensorId}`;
        const tableExists = await checkIfSensorTableExists(companyId, sensorId);

        if (!tableExists) {
            console.error(`❌ Table ${tableName} does not exist. Data insertion skipped.`);
            return res.status(500).json({ message: `Table ${tableName} does not exist.` });
        }

        // ✅ Convert timestamps properly for MySQL
        const values = batch.map(({ sensor_id, value, quality, quality_good, timestamp }) => [
            sensor_id,
            value,
            quality,
            quality_good,
            new Date(timestamp).toISOString().slice(0, 19).replace("T", " ") // Ensure MySQL DATETIME format
        ]);

        if (values.length === 0) {
            console.warn("⚠ No valid data to insert.");
            return res.status(400).json({ message: "No valid sensor data to insert." });
        }

        const insertQuery = `
            INSERT INTO ${tableName} (sensor_id, value, quality, quality_good, timestamp)
            VALUES ?
        `;

        console.log(`📝 SQL Query: ${insertQuery}`);
        console.log(`📋 Data to Insert:`, JSON.stringify(values, null, 2));

        // ✅ Execute Query
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
