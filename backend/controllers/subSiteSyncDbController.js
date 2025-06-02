const db = require("../db/connector");
const jwt = require("jsonwebtoken");

const getAdminDetailsFromToken = (req) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return null;
    return jwt.verify(token, process.env.JWT_SECRET_APP);
  } catch (error) {
    console.error("❌ Error decoding JWT:", error.message);
    return null;
  }
};


const cloneTableStructure = async (sourceTable, targetTable) => {
  const [rows] = await db.execute(`SHOW CREATE TABLE ${sourceTable}`);
  const createSQL = rows[0]['Create Table'].replaceAll(`\`${sourceTable}\``, `\`${targetTable}\``);
  await db.execute(createSQL);
};

const syncSubSiteLocalDbFromCloud = async (req, res) => {
  try {
    const adminDetails = getAdminDetailsFromToken(req);
    const subsiteId = req.query.subsiteId;

    if (!adminDetails || !subsiteId) {
      return res.status(400).json({ message: "Missing token or subsiteId" });
    }

    const companyId = adminDetails.companyId || adminDetails.company_id;
    const bankTable = `SensorBank_${companyId}_${subsiteId}`;
    const activeTable = `Sensor_${companyId}_${subsiteId}`;
    const apiTable = `SensorAPI_${companyId}_${subsiteId}`;

    const cloudBankTable = `SensorBank_${companyId}`;
    const cloudActiveTable = `Sensor_${companyId}`;
    const cloudApiTable = `SensorAPI_${companyId}`;

    console.log(`🔄 Syncing Sub-site Tables for Company ${companyId}, Subsite ${subsiteId}`);

    await cloneTableStructure(cloudBankTable, bankTable);
    await cloneTableStructure(cloudActiveTable, activeTable);
    await cloneTableStructure(cloudApiTable, apiTable);

    const [bankRows] = await db.execute(`SELECT * FROM ${cloudBankTable} WHERE subsite_id = ?`, [subsiteId]);
    for (const row of bankRows) {
      await db.execute(
        `INSERT IGNORE INTO ${bankTable} (id, name, description, object_id, property_name, data_type, is_active, room_id, created_at, updated_at, subsite_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [row.id, row.name, row.description, row.object_id, row.property_name, row.data_type, row.is_active, row.room_id, row.created_at, row.updated_at, subsiteId]
      );
    }

    const [activeRows] = await db.execute(
      `SELECT s.* FROM ${cloudActiveTable} s JOIN ${cloudBankTable} b ON s.bank_id = b.id WHERE b.subsite_id = ?`,
      [subsiteId]
    );
    for (const row of activeRows) {
      await db.execute(
        `INSERT IGNORE INTO ${activeTable} (id, bank_id, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
        [row.id, row.bank_id, row.is_active, row.created_at, row.updated_at]
      );
    }

    const [apiRows] = await db.execute(
      `SELECT a.* FROM ${cloudApiTable} a
       JOIN ${cloudActiveTable} s ON a.sensor_id = s.id
       JOIN ${cloudBankTable} b ON s.bank_id = b.id
       WHERE b.subsite_id = ?`,
      [subsiteId]
    );
    for (const row of apiRows) {
      await db.execute(
        `INSERT IGNORE INTO ${apiTable} (id, sensor_id, api_endpoint, created_at) VALUES (?, ?, ?, ?)`,
        [row.id, row.sensor_id, row.api_endpoint, row.created_at]
      );
    }

    const sensorDataTables = [];
    for (const sensor of activeRows) {
      const sensorDataTable = `SensorData_${companyId}_${subsiteId}_${sensor.bank_id}`;
      sensorDataTables.push(sensorDataTable);
      await db.execute(`
        CREATE TABLE IF NOT EXISTS ${sensorDataTable} (
          id INT AUTO_INCREMENT PRIMARY KEY,
          sensor_id INT NOT NULL,
          value VARCHAR(255),
          quality VARCHAR(255),
          quality_good BOOLEAN,
          timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (sensor_id) REFERENCES ${activeTable}(bank_id) ON DELETE CASCADE
        )
      `);
    }

    res.status(200).json({
      message: "✅ Sub-site DB sync completed",
      sensorBank: bankRows,
      activeSensors: activeRows,
      sensorApis: apiRows,
      sensorDataTables
    });

  } catch (err) {
    console.error("❌ Sub-site sync error:", err.message);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

module.exports = { syncSubSiteLocalDbFromCloud };
