const db = require("../db/connector");
const jwt = require("jsonwebtoken");

// Extract admin details from token
const getAdminDetailsFromToken = (req) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    return jwt.verify(token, process.env.JWT_SECRET_APP);
  } catch (err) {
    return null;
  }
};

// Controller: Sync sub-site tables to local DB
const syncSubSiteLocalDbFromCloud = async (req, res) => {
  try {
    const admin = getAdminDetailsFromToken(req);
    if (!admin) return res.status(401).json({ message: "Unauthorized" });

    const companyId = admin.companyId;

    // Fetch all sub-sites for the company
    const [subsites] = await db.execute(
      `SELECT id FROM Company WHERE parent_company_id = ?`,
      [companyId]
    );

    const results = [];

    for (const { id: subsiteId } of subsites) {
      // Define dynamic sub-site-specific table names
      const bankTable = `SensorBank_${companyId}_${subsiteId}`;
      const sensorTable = `Sensor_${companyId}_${subsiteId}`;
      const apiTable = `SensorAPI_${companyId}_${subsiteId}`;

      // Fetch data from those tables (no WHERE clauses needed)
      const [bankRows] = await db.execute(`SELECT * FROM ${bankTable}`);
      const [sensorRows] = await db.execute(`SELECT * FROM ${sensorTable}`);
      const [apiRows] = await db.execute(`SELECT * FROM ${apiTable}`);

      // Extract bank_ids to tell local DB what SensorData tables to create
      const sensorDataBankIds = [...new Set(sensorRows.map(s => s.bank_id))];

      // Push sub-site data into response array
      results.push({
        subsiteId,
        sensorBank: bankRows,
        activeSensors: sensorRows,
        sensorApis: apiRows,
        sensorDataBankIds
      });
    }

    // Send all sub-site data back to native app
    res.json({ result: results });
  } catch (err) {
    console.error("❌ Cloud Sub-site sync error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { syncSubSiteLocalDbFromCloud };
