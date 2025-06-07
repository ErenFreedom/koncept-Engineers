const db = require("../db/connector");
const jwt = require("jsonwebtoken");

/** ✅ Check if table exists */
const checkIfSensorTableExists = async (tableName) => {
  try {
    console.log(`🔍 Checking if table ${tableName} exists...`);
    const [results] = await db.execute(`SHOW TABLES LIKE '${tableName}'`);
    return results.length > 0;
  } catch (error) {
    console.error(`❌ ERROR: Checking table ${tableName} failed.`, error.message);
    return false;
  }
};

const insertSubsiteSensorData = async (req, res) => {
  try {
    console.log("🚀 Incoming sub-site sensor data...");

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      console.error("❌ No token provided in headers.");
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_APP);
    const { companyId } = decoded;

    console.log("🔑 Token Decoded:", decoded);

    const { subsiteId, sensorId, batch } = req.body;

    console.log("📦 Payload received:", JSON.stringify(req.body, null, 2));

    if (!companyId || !subsiteId || !sensorId || !Array.isArray(batch) || batch.length === 0) {
      console.error("❌ Missing or invalid fields in payload.");
      return res.status(400).json({ message: "companyId, subsiteId, sensorId and non-empty batch are required" });
    }

    const tableName = `SensorData_${companyId}_${subsiteId}_${sensorId}`;
    console.log(`📌 Target Table: ${tableName}`);

    const tableExists = await checkIfSensorTableExists(tableName);
    if (!tableExists) {
      console.error(`❌ Table ${tableName} does not exist.`);
      return res.status(500).json({ message: `Table ${tableName} does not exist.` });
    }

    const values = batch.map(({ sensor_id, value, quality, quality_good, timestamp }) => [
      sensor_id,
      value,
      quality,
      quality_good,
      new Date(timestamp).toISOString().slice(0, 19).replace("T", " ")
    ]);

    const placeholders = values.map(() => `(?, ?, ?, ?, ?)`).join(", ");
    const insertQuery = `INSERT INTO ${tableName} (sensor_id, value, quality, quality_good, timestamp) VALUES ${placeholders}`;

    console.log("📝 Prepared SQL:", insertQuery);
    console.log("📊 Values:", JSON.stringify(values, null, 2));

    await db.execute(insertQuery, values.flat());

    console.log(`✅ SUCCESS: Inserted ${batch.length} records into ${tableName}`);
    return res.status(200).json({ message: "Data inserted successfully", inserted: batch.length });

  } catch (error) {
    console.error("❌ ERROR: Subsite insert failed:", error.message);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = { insertSubsiteSensorData };
