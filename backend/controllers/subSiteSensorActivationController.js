const db = require("../db/connector");
const jwt = require("jsonwebtoken");

const getAdminDetailsFromToken = (req) => {
  try {
    const authHeader =
      req.headers.authorization ||
      req.headers.Authorization ||
      req.get?.("authorization") ||
      req.get?.("Authorization");

    console.log("📨 Raw Auth Header:", authHeader);
    console.log("🔐 JWT_SECRET_APP:", process.env.JWT_SECRET_APP?.length + " chars");

    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    console.log("📦 Extracted Token:", token?.substring(0, 40) + "...");

    if (!token) {
      console.error("❌ No token found in request headers");
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_APP);
    console.log("✅ Token decoded successfully:", decoded);

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



const activateSubSiteSensor = async (req, res) => {
    try {
      const { sensorId, subsiteId } = req.body;
  
      if (!sensorId || !subsiteId) {
        return res.status(400).json({ message: "Sensor ID and Sub-site ID are required" });
      }
  
      const adminDetails = getAdminDetailsFromToken(req);
      if (!adminDetails) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
      }
  
      const { companyId } = adminDetails;
  
      const bankTable = `SensorBank_${companyId}_${subsiteId}`;
      const activeTable = `Sensor_${companyId}_${subsiteId}`;
      const sensorDataTable = `SensorData_${companyId}_${subsiteId}_${sensorId}`;
  
      console.log(`🔍 Activating Sensor ${sensorId} in Sub-site ${subsiteId} for Company ${companyId}`);
  
      const [sensorExists] = await db.execute(
        `SELECT * FROM ${bankTable} WHERE id = ?`,
        [sensorId]
      );
      if (sensorExists.length === 0) {
        return res.status(404).json({ message: "Sensor not found in Sensor Bank" });
      }
  
      const [alreadyActive] = await db.execute(
        `SELECT * FROM ${activeTable} WHERE bank_id = ?`,
        [sensorId]
      );
      if (alreadyActive.length > 0) {
        return res.status(400).json({ message: "Sensor is already activated" });
      }
  
      await db.execute(
        `INSERT INTO ${activeTable} (bank_id, is_active) VALUES (?, 1)`,
        [sensorId]
      );
      console.log(`✅ Sensor ${sensorId} added to active table ${activeTable}`);
  
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS ${sensorDataTable} (
          id INT AUTO_INCREMENT PRIMARY KEY,
          sensor_id INT NOT NULL,
          value VARCHAR(255),
          quality VARCHAR(255),
          quality_good BOOLEAN,
          timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (sensor_id) REFERENCES ${activeTable}(bank_id) ON DELETE CASCADE
        )
      `;
      await db.execute(createTableQuery);
      console.log(`✅ SensorData table ${sensorDataTable} created.`);
  
      res.status(200).json({ message: `✅ Sensor ${sensorId} activated successfully in Sub-site ${subsiteId}` });
  
    } catch (error) {
      console.error("❌ Error activating sub-site sensor:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  };
  

const deactivateSubSiteSensor = async (req, res) => {
  try {
    const { sensorId, subsiteId } = req.body;

    if (!sensorId || !subsiteId) {
      return res.status(400).json({ message: "Sensor ID and Sub-site ID are required" });
    }

    const adminDetails = getAdminDetailsFromToken(req);
    if (!adminDetails) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const { companyId } = adminDetails;
    const activeTable = `Sensor_${companyId}_${subsiteId}`;

    console.log(`🔍 Deactivating Sensor ${sensorId} in Sub-site ${subsiteId} for Company ${companyId}`);

    const [sensor] = await db.execute(
      `SELECT * FROM ${activeTable} WHERE bank_id = ?`,
      [sensorId]
    );

    if (sensor.length === 0) {
      return res.status(404).json({ message: "Sensor is not active" });
    }

    await db.execute(
      `UPDATE ${activeTable} SET is_active = 0 WHERE bank_id = ?`,
      [sensorId]
    );

    console.log(`✅ Sensor ${sensorId} deactivated in active table ${activeTable}`);
    res.status(200).json({ message: `✅ Sensor ${sensorId} deactivated successfully in Sub-site ${subsiteId}` });

  } catch (error) {
    console.error("❌ Error deactivating sub-site sensor:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const removeActiveSubSiteSensor = async (req, res) => {
  try {
    const { sensorId, subsiteId } = req.body;

    if (!sensorId || !subsiteId) {
      return res.status(400).json({ message: "Sensor ID and Sub-site ID are required" });
    }

    const adminDetails = getAdminDetailsFromToken(req);
    if (!adminDetails) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const { companyId } = adminDetails;
    const sensorTable = `Sensor_${companyId}_${subsiteId}`;
    const sensorDataTable = `SensorData_${companyId}_${subsiteId}_${sensorId}`;

    const [sensor] = await db.execute(
      `SELECT * FROM ${sensorTable} WHERE bank_id = ?`,
      [sensorId]
    );

    if (sensor.length === 0) {
      return res.status(404).json({ message: "Sensor not found in Active Sensors" });
    }

    if (sensor[0].is_active === 1) {
      return res.status(400).json({ message: "Sensor must be deactivated before removal" });
    }

    await db.execute(`DELETE FROM ${sensorTable} WHERE bank_id = ?`, [sensorId]);
    console.log(`✅ Sensor ${sensorId} deleted from ${sensorTable}`);

    try {
      await db.execute(`DROP TABLE IF EXISTS ${sensorDataTable}`);
      console.log(`🗑 Table ${sensorDataTable} dropped successfully.`);
    } catch (dropErr) {
      console.error(`❌ Error dropping table ${sensorDataTable}:`, dropErr.message);
      return res.status(500).json({ message: "Failed to drop sensor data table", error: dropErr.message });
    }

    res.status(200).json({ message: `Sensor ${sensorId} removed and table ${sensorDataTable} dropped successfully` });

  } catch (error) {
    console.error("❌ Error in removeActiveSubSiteSensor:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

  const getAllActiveSubSiteSensors = async (req, res) => {
    try {
      const subsiteId = req.query.subsite_id || req.query.subsiteId;

      const adminDetails = getAdminDetailsFromToken(req);
      if (!adminDetails || !subsiteId) {
        return res.status(401).json({ message: "Unauthorized or Sub-site ID missing" });
      }
  
      const { companyId } = adminDetails;
      const sensorTable = `Sensor_${companyId}_${subsiteId}`;
      const bankTable = `SensorBank_${companyId}_${subsiteId}`;
  
      const [sensors] = await db.execute(`
        SELECT s.*, s.bank_id AS id, b.name
        FROM ${sensorTable} s
        JOIN ${bankTable} b ON s.bank_id = b.id

      `);
  
      res.status(200).json({ sensors });
    } catch (error) {
      console.error("❌ Error fetching active sub-site sensors:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  };
  
  const getAllManagedSubSiteSensors = async (req, res) => {
    try {
      const { subsiteId } = req.query;
      const adminDetails = getAdminDetailsFromToken(req);
      if (!adminDetails || !subsiteId) {
        return res.status(401).json({ message: "Unauthorized or Sub-site ID missing" });
      }
  
      const { companyId } = adminDetails;
      const sensorTable = `Sensor_${companyId}_${subsiteId}`;
  
      const [sensors] = await db.execute(`SELECT * FROM ${sensorTable}`);
      res.status(200).json({ sensors });
    } catch (error) {
      console.error("❌ Error fetching managed sub-site sensors:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  };
  
  const reactivateSubSiteSensor = async (req, res) => {
  try {
    const { sensorId, subsiteId } = req.body;

    if (!sensorId || !subsiteId) {
      return res.status(400).json({ message: "Sensor ID and Sub-site ID are required" });
    }

    const adminDetails = getAdminDetailsFromToken(req);
    if (!adminDetails) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const { companyId } = adminDetails;
    const sensorTable = `Sensor_${companyId}_${subsiteId}`;

    const [sensor] = await db.execute(
      `SELECT * FROM ${sensorTable} WHERE bank_id = ?`,
      [sensorId]
    );

    if (sensor.length === 0) {
      return res.status(404).json({ message: "Sensor not found in managed sensors" });
    }

    if (sensor[0].is_active === 1) {
      return res.status(400).json({ message: "Sensor is already active" });
    }

    await db.execute(
      `UPDATE ${sensorTable} SET is_active = 1 WHERE bank_id = ?`,
      [sensorId]
    );

    console.log(`✅ Sensor ${sensorId} reactivated successfully in ${sensorTable}`);
    res.status(200).json({ message: `Sensor ${sensorId} reactivated successfully` });

  } catch (error) {
    console.error("❌ Error reactivating sub-site sensor:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


module.exports = {
  activateSubSiteSensor,
  deactivateSubSiteSensor,
  removeActiveSubSiteSensor,
  getAllActiveSubSiteSensors,
  getAllManagedSubSiteSensors,
  reactivateSubSiteSensor
};
