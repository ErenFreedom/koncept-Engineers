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
                console.error(`❌ ERROR: Checking table ${tableName} failed.`, err.message);
                reject(err);
                return;
            }

            if (results.length > 0) {
                console.log(`✅ Table ${tableName} FOUND.`);
                resolve(true);
            } else {
                console.warn(`⚠ WARNING: Table ${tableName} does NOT exist.`);
                resolve(false);
            }
        });
    });
};


/** ✅ Insert Sensor Data into Cloud DB */
const insertSensorData = async (req, res) => {
    try {
        console.log("🚀 Received request to insert sensor data...");

        // ✅ Extract company ID from token
        const companyId = getCompanyIdFromToken(req);
        if (!companyId) {
            console.error("❌ ERROR: Unauthorized request - Invalid Token");
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }

        const { sensorId, batch } = req.body;

        console.log(`📤 Incoming batch data for Sensor ${sensorId}, Company ${companyId}`);
        console.log(JSON.stringify(batch, null, 2));

        if (!sensorId || !batch || !Array.isArray(batch) || batch.length === 0) {
            console.error("❌ ERROR: Invalid sensor data format.");
            return res.status(400).json({ message: "Sensor ID and batch data are required." });
        }

        const tableName = `SensorData_${companyId}_${sensorId}`;
        console.log(`🔍 Verifying table existence: ${tableName}`);

        const tableExists = await checkIfSensorTableExists(companyId, sensorId);
        console.log(`✅ Table ${tableName} Check Result:`, tableExists);

        if (!tableExists) {
            console.error(`❌ ERROR: Table ${tableName} does not exist. Cannot insert.`);
            return res.status(500).json({ message: `Table ${tableName} does not exist.` });
        }

        console.log(`✅ Proceeding with inserting data into ${tableName}`);

        // ✅ Convert timestamps properly for MySQL
        const values = batch.map(({ sensor_id, value, quality, quality_good, timestamp }) => [
            sensor_id,
            value,
            quality,
            quality_good,
            new Date(timestamp).toISOString().slice(0, 19).replace("T", " ") // MySQL DATETIME format
        ]);

        if (values.length === 0) {
            console.warn("⚠ WARNING: No valid data to insert.");
            return res.status(400).json({ message: "No valid sensor data to insert." });
        }

        const insertQuery = `
            INSERT INTO ${tableName} (sensor_id, value, quality, quality_good, timestamp)
            VALUES ?
        `;

        console.log(`📝 SQL Query Prepared: ${insertQuery}`);
        console.log(`📋 Data to Insert:`, JSON.stringify(values, null, 2));

        // ✅ Execute Query
        db.query(insertQuery, [values], (err, result) => {
            if (err) {
                console.error(`❌ ERROR: Inserting batch data into ${tableName} failed.`, err.message);
                return res.status(500).json({ message: `Failed to insert batch data into ${tableName}`, error: err.message });
            }

            console.log(`✅ SUCCESS: Inserted ${batch.length} records into ${tableName}`);
            res.status(200).json({ message: "Data inserted successfully", inserted: batch.length });
        });

    } catch (error) {
        console.error("❌ ERROR: Unexpected error in processing sensor data.", error.message);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


/** ✅ Export Functions */
module.exports = { insertSensorData };
