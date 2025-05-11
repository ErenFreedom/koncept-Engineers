const db = require("../db/connector");
const jwt = require("jsonwebtoken");
const { createSensorDataTable } = require("../db/sensorDB"); // ✅ already defined in your local setup

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

/** ✅ Sync cloud to local: create SensorData tables only (no data insert) */
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

    // ✅ Get Sensor API endpoints
    const [sensorApiRows] = await db.execute(`SELECT * FROM ${sensorApiTable}`);

    // ✅ Create empty SensorData_<companyId>_<sensorId> tables locally
    const createdTables = [];
    for (const sensor of activeSensorRows) {
      const sensorId = sensor.bank_id;
      try {
        await createSensorDataTable(companyId, sensorId);
        createdTables.push(`SensorData_${companyId}_${sensorId}`);
      } catch (e) {
        console.warn(`⚠️ Could not create table SensorData_${companyId}_${sensorId}:`, e.message);
      }
    }

    return res.status(200).json({
      message: "Local DB synced: tables created, no data inserted",
      sensorBank: sensorBankRows,
      activeSensors: activeSensorRows,
      sensorApis: sensorApiRows,
      createdTables
    });

  } catch (err) {
    console.error("❌ Cloud DB Sync Error:", err.message);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

module.exports = { syncLocalDbFromCloud };
