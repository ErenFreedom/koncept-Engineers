const db = require("../db/connector");
const jwt = require("jsonwebtoken");

const getAdminDetailsFromToken = (req) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    return jwt.verify(token, process.env.JWT_SECRET_APP);
  } catch (err) {
    return null;
  }
};

const syncSubSiteLocalDbFromCloud = async (req, res) => {
  try {
    const admin = getAdminDetailsFromToken(req);
    if (!admin) return res.status(401).json({ message: "Unauthorized" });

    const companyId = admin.companyId;
    const [subsites] = await db.execute(
      `SELECT id FROM Company WHERE parent_company_id = ?`,
      [companyId]
    );

    const results = [];

    for (const { id: subsiteId } of subsites) {
      const bankTable = `SensorBank_${companyId}`;
      const sensorTable = `Sensor_${companyId}`;
      const apiTable = `SensorAPI_${companyId}`;

      // SensorBank rows for this subsite
      const [bankRows] = await db.execute(
        `SELECT * FROM ${bankTable} WHERE subsite_id = ?`, [subsiteId]
      );

      // Sensor rows linked to above banks
      const [sensorRows] = await db.execute(
        `SELECT s.* FROM ${sensorTable} s
         JOIN ${bankTable} b ON s.bank_id = b.id
         WHERE b.subsite_id = ?`, [subsiteId]
      );

      // API rows linked to those sensors
      const [apiRows] = await db.execute(
        `SELECT a.* FROM ${apiTable} a
         JOIN ${sensorTable} s ON a.sensor_id = s.id
         JOIN ${bankTable} b ON s.bank_id = b.id
         WHERE b.subsite_id = ?`, [subsiteId]
      );

      // Extract unique bank_ids (for SensorData tables)
      const sensorDataBankIds = [...new Set(sensorRows.map(s => s.bank_id))];

      results.push({
        subsiteId,
        sensorBank: bankRows,
        activeSensors: sensorRows,
        sensorApis: apiRows,
        sensorDataBankIds
      });
    }

    res.json({ result: results });
  } catch (err) {
    console.error("❌ Cloud Sub-site sync error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { syncSubSiteLocalDbFromCloud };
