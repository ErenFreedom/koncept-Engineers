const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

let isProd = false;
try {
  isProd = require("electron").app.isPackaged;
} catch (_) {}

const dbPath = isProd
  ? path.join(process.resourcesPath, "db", "localDB.sqlite")
  : path.join(__dirname, "localDB.sqlite");

// ✅ Create file if it doesn't exist
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, "");
  console.log("📂 Created new localDB.sqlite");
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("❌ Error opening DB:", err.message);
  else console.log("✅ Local database connected.");
});

// ✅ Table Definitions

const tables = [
  `CREATE TABLE IF NOT EXISTS AuthTokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS DesigoAuthTokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS IntervalControl (
    sensor_id INTEGER PRIMARY KEY,
    is_fetching INTEGER DEFAULT 0,
    is_sending INTEGER DEFAULT 0,
    FOREIGN KEY(sensor_id) REFERENCES LocalSensorBank(id) ON DELETE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS SensorLogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sensor_id INTEGER,
    log TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(sensor_id) REFERENCES LocalSensorBank(id) ON DELETE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS LocalSensorBank (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT DEFAULT NULL,
    object_id TEXT UNIQUE NOT NULL,
    property_name TEXT NOT NULL,
    data_type TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS LocalActiveSensors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bank_id INTEGER NOT NULL UNIQUE,
    mode TEXT CHECK( mode IN ('real_time', 'manual') ) NOT NULL DEFAULT 'manual',
    interval_seconds INTEGER CHECK( interval_seconds >= 5 AND interval_seconds <= 100 ) DEFAULT 10,
    batch_size INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bank_id) REFERENCES LocalSensorBank(id) ON DELETE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS LocalSensorAPIs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sensor_id INTEGER NOT NULL UNIQUE,
    api_endpoint TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (sensor_id) REFERENCES LocalSensorBank(id) ON DELETE CASCADE
  );`
];

// ✅ Create all tables
db.serialize(() => {
  tables.forEach((sql) => {
    db.run(sql, (err) => {
      if (err) console.error("❌ Table error:", err.message);
    });
  });
});

module.exports = db;
