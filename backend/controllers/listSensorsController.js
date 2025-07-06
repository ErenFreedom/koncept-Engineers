const db = require("../db/connector");
const jwt = require("jsonwebtoken");


const getAdminDetailsFromToken = (req) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET_APP);

    console.log("🔍 Extracted Admin Details from Token:", decoded);

    const companyId = decoded.companyId || decoded.company_id;
    if (!companyId) {
      console.error("❌ Error: companyId is undefined in JWT", decoded);
      return null;
    }

    return { companyId, adminId: decoded.adminId };
  } catch (error) {
    console.error("❌ Error decoding JWT:", error.message);
    return null;
  }
};


const getCloudAdminDetailsFromToken = (req) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET); 

    console.log("🔍 [Cloud] Extracted Admin Details from Token:", decoded);

    const companyId = decoded.companyId || decoded.company_id;
    if (!companyId) {
      console.error("❌ [Cloud] Error: companyId is undefined in JWT", decoded);
      return null;
    }

    return { companyId, adminId: decoded.adminId };
  } catch (error) {
    console.error("❌ [Cloud] Error decoding JWT:", error.message);
    return null;
  }
};



const listSensors = async (req, res) => {
  try {

    const adminDetails = getAdminDetailsFromToken(req);
    if (!adminDetails) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    const { companyId } = adminDetails;

    console.log(`🔍 Fetching Sensors for Company ${companyId}`);


    const [sensors] = await db.execute(`SELECT * FROM SensorBank_${companyId}`);

    if (!sensors || sensors.length === 0) {
      return res.status(404).json({ message: "No sensors found" });
    }

    console.log(`✅ Found ${sensors.length} sensors`);
    res.status(200).json({ sensors });

  } catch (error) {
    console.error("❌ Error fetching SensorBank:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


const listFullSensorInfo = async (req, res) => {
  try {
    const { companyId } = req.admin;

    const bankTable = `SensorBank_${companyId}`;
    const activeTable = `Sensor_${companyId}`;
    const apiTable = `SensorAPI_${companyId}`;

    const [rows] = await db.query(`
        SELECT 
          sb.id AS bank_id,
          sb.name,
          sb.description,
          sb.object_id,
          sb.property_name,
          sb.data_type,
          sa.api_endpoint,
          s.id AS local_sensor_id
        FROM ${bankTable} sb
        JOIN ${activeTable} s ON sb.id = s.bank_id
        LEFT JOIN ${apiTable} sa ON sa.sensor_id = sb.id
        WHERE s.is_active = 1
      `);

    const enriched = await Promise.all(rows.map(async (sensor) => {
      const dataTable = `SensorData_${companyId}_${sensor.bank_id}`;
      try {
        const [dataRows] = await db.query(`
            SELECT value, quality, quality_good, timestamp
            FROM ${dataTable}
            ORDER BY timestamp DESC
            LIMIT 1
          `);
        return {
          ...sensor,
          latestData: dataRows[0] || null,
        };
      } catch (err) {
        console.warn(`⚠️ No data table for sensor ${sensor.bank_id}:`, err.message);
        return {
          ...sensor,
          latestData: null,
        };
      }
    }));

    res.status(200).json({ sensors: enriched });
  } catch (err) {
    console.error("❌ Failed to fetch full sensor info:", err.message);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};


const listActiveSensorsMainSite = async (req, res) => {
  const admin = getCloudAdminDetailsFromToken(req);
  if (!admin) return res.status(401).json({ message: "Unauthorized" });
  const { companyId } = admin;

  const sensorTable = `Sensor_${companyId}`;
  const bankTable = `SensorBank_${companyId}`;

  try {
    const [rows] = await db.query(`
      SELECT
        s.id AS sensor_id,
        s.bank_id,
        s.poe_id,
        s.is_active,
        sb.name AS sensor_name,
        sb.description,
        sb.object_id,
        sb.property_name,
        sb.data_type
      FROM ${sensorTable} s
      JOIN ${bankTable} sb ON s.bank_id = sb.id
      WHERE s.is_active = 1
    `);

    res.status(200).json({ sensors: rows });
  } catch (err) {
    console.error("❌ Error fetching main site active sensors:", err.message);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};





const listActiveSensorsSubSite = async (req, res) => {
  const admin = getCloudAdminDetailsFromToken(req);
  const subsiteId = req.query.subsite_id || req.query.subsiteId;

  if (!admin || !subsiteId) return res.status(401).json({ message: "Unauthorized or missing sub-site ID" });
  const { companyId } = admin;

  const sensorTable = `Sensor_${companyId}_${subsiteId}`;
  const bankTable = `SensorBank_${companyId}_${subsiteId}`;

  try {
    const [rows] = await db.query(`
      SELECT
        s.id AS sensor_id,
        s.bank_id,
        s.poe_id,
        s.is_active,
        sb.name AS sensor_name,
        sb.description,
        sb.object_id,
        sb.property_name,
        sb.data_type
      FROM ${sensorTable} s
      JOIN ${bankTable} sb ON s.bank_id = sb.id
      WHERE s.is_active = 1
    `);

    res.status(200).json({ sensors: rows });
  } catch (err) {
    console.error("❌ Error fetching sub-site active sensors:", err.message);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

module.exports = { listSensors, listFullSensorInfo, listActiveSensorsMainSite, listActiveSensorsSubSite, };
