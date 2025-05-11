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

/** ✅ Sync route: Return sensor bank, active sensors, sensor APIs, and expected SensorData table names only */
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

    // ✅ Get Sensor API endpoints (includes created_at)
    const [sensorApiRows] = await db.execute(`SELECT * FROM ${sensorApiTable}`);

    // ✅ Build expected SensorData table names only (do NOT fetch data)
    const sensorDataTables = activeSensorRows.map(sensor =>
      `SensorData_${companyId}_${sensor.bank_id}`
    );

    // ✅ Final response (no actual sensor data rows)
    return res.status(200).json({
      sensorBank: sensorBankRows,
      activeSensors: activeSensorRows,
      sensorApis: sensorApiRows,
      sensorDataTables,
      sensorData: {} // Empty because we're skipping row fetch
    });

  } catch (err) {
    console.error("❌ Cloud DB Sync Error:", err.message);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

module.exports = { syncLocalDbFromCloud };
