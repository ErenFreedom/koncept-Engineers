const axios = require("axios");
const { db, createSensorDataTable } = require("../db/sensorDB");

const CLOUD_SYNC_ENDPOINT = `${process.env.CLOUD_API_URL}/api/cloud/sync/local-db`;

/** ✅ Controller to sync local DB with cloud */
const syncFromCloud = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    const response = await axios.get(CLOUD_SYNC_ENDPOINT, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { sensorBank, activeSensors, sensorApis, sensorData } = response.data;

    // ✅ Insert into LocalSensorBank
    for (const sensor of sensorBank) {
      db.run(
        `INSERT OR REPLACE INTO LocalSensorBank (id, name, description, object_id, property_name, data_type, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sensor.id,
          sensor.name,
          sensor.description || null,
          sensor.object_id,
          sensor.property_name,
          sensor.data_type,
          sensor.is_active,
          sensor.created_at,
          sensor.updated_at,
        ],
        (err) => {
          if (err) console.error("❌ Failed to insert into LocalSensorBank:", err.message);
        }
      );
    }

    // ✅ Insert into LocalActiveSensors
    for (const active of activeSensors) {
      db.run(
        `INSERT OR REPLACE INTO LocalActiveSensors (id, bank_id, mode, interval_seconds, batch_size, is_active, created_at, updated_at)
         VALUES (?, ?, 'manual', 10, 1, ?, ?, ?)`,
        [
          active.id,
          active.bank_id,
          active.is_active,
          active.created_at,
          active.updated_at,
        ],
        (err) => {
          if (err) console.error("❌ Failed to insert into LocalActiveSensors:", err.message);
        }
      );
    }

    // ✅ Insert into LocalSensorAPIs (skip created_at)
    for (const api of sensorApis) {
      db.run(
        `INSERT OR REPLACE INTO LocalSensorAPIs (sensor_id, api_endpoint) VALUES (?, ?)`,
        [api.sensor_id, api.api_endpoint],
        (err) => {
          if (err) {
            console.error("❌ Failed to insert into LocalSensorAPIs:", err.message);
          } else {
            console.log(`✅ Inserted API for sensor ${api.sensor_id}`);
          }
        }
      );
    }

    // ✅ Create SensorData tables and insert data
    for (const tableName in sensorData) {
      const rows = sensorData[tableName];

      const parts = tableName.split("_");
      const companyId = parts[1];
      const sensorId = parts[2];

      await createSensorDataTable(companyId, sensorId);

      for (const row of rows) {
        db.run(
          `INSERT INTO ${tableName} (id, sensor_id, value, quality, quality_good, timestamp, sent_to_cloud)
           VALUES (?, ?, ?, ?, ?, ?, 1)`,
          [
            row.id,
            row.sensor_id,
            row.value,
            row.quality,
            row.quality_good,
            row.timestamp,
          ],
          (err) => {
            if (err) {
              console.error(`❌ Failed to insert into ${tableName}:`, err.message);
            }
          }
        );
      }
    }

    res.status(200).json({ message: "✅ Local DB populated from cloud successfully." });
  } catch (err) {
    console.error("❌ Sync from cloud failed:", err.message);
    res.status(500).json({ message: "Failed to sync from cloud", error: err.message });
  }
};

module.exports = { syncFromCloud };
