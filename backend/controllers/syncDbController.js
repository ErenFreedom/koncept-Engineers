const db = require("../db/connector");
const jwt = require("jsonwebtoken");

/** ✅ Extract companyId from token */
const getCompanyIdFromToken = (req) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET_APP);
    return decoded.companyId || decoded.company_id;
  } catch (err) {
    console.error("❌ JWT Error:", err.message);
    return null;
  }
};

/** ✅ Return sensor bank + active sensors + sensor data + sensor API endpoints (includes created_at) */
const syncLocalDbFromCloud = async (req, res) => {
  try {
    const companyId = getCompanyIdFromToken(req);
    if (!companyId) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const sensorBankTable = `SensorBank_${companyId}`;
    const sensorActiveTable = `Sensor_${companyId}`;
    const sensorApiTable = `SensorAPI_${companyId}`;

    // ✅ Get Sensor Bank
    const [sensorBankRows] = await db.execute(`SELECT * FROM ${sensorBankTable}`);

    // ✅ Get Active Sensors
    const [activeSensorRows] = await db.execute(`SELECT * FROM ${sensorActiveTable} WHERE is_active = 1`);

    // ✅ Get Sensor API endpoints (now includes created_at)
    const [sensorApiRows] = await db.execute(`SELECT * FROM ${sensorApiTable}`);

    // ✅ Get Sensor Data for active sensors
    const sensorData = {};
    for (const sensor of activeSensorRows) {
      const tableName = `SensorData_${companyId}_${sensor.bank_id}`;
      try {
        const [rows] = await db.execute(`SELECT * FROM ${tableName}`);
        sensorData[tableName] = rows;
      } catch (e) {
        console.warn(`⚠️ Skipped missing table: ${tableName}`);
      }
    }

    return res.status(200).json({
      sensorBank: sensorBankRows,
      activeSensors: activeSensorRows,
      sensorApis: sensorApiRows,
      sensorDataTables: Object.keys(sensorData),
      sensorData,
    });
  } catch (err) {
    console.error("❌ Cloud DB Sync Error:", err.message);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

module.exports = { syncLocalDbFromCloud };
