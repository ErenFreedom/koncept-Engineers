const sqlite3 = require("sqlite3").verbose();

// ✅ Connect to SQLite
const db = new sqlite3.Database("./desigo_sensors.db", (err) => {
    if (err) {
        console.error("❌ Error opening database:", err.message);
    } else {
        console.log("✅ Connected to SQLite database.");
    }
});

// ✅ **Delete Existing Data & Reset Auto-Increment**
db.serialize(() => {
    db.run("DELETE FROM sensor_data", (err) => {
        if (err) {
            console.error("❌ Error deleting existing sensor data:", err.message);
        } else {
            console.log("✅ Existing sensor data deleted.");
        }
    });

    db.run("UPDATE SQLITE_SEQUENCE SET seq = 0 WHERE name = 'sensor_data'", (err) => {
        if (err) {
            console.error("❌ Error resetting auto-increment:", err.message);
        } else {
            console.log("✅ Auto-increment reset.");
        }
    });
});

// ✅ **Create Authentication Table for Desigo Token**
const createAuthTableSQL = `
    CREATE TABLE IF NOT EXISTS DesigoAuthTokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

db.run(createAuthTableSQL, (err) => {
    if (err) {
        console.error("❌ Error creating DesigoAuthTokens table:", err.message);
    } else {
        console.log("✅ DesigoAuthTokens table created.");
    }
});

// ✅ **Create Sensor Data Table**
const createSensorTableSQL = `
    CREATE TABLE IF NOT EXISTS sensor_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sensor_id INTEGER,
        data_type TEXT,
        value TEXT,
        quality TEXT,
        quality_good BOOLEAN,
        timestamp TEXT,
        original_object_property_id TEXT,
        object_id TEXT,
        property_name TEXT,
        attribute_id TEXT,
        error_code INTEGER,
        is_array BOOLEAN
    );
`;

db.run(createSensorTableSQL, (err) => {
    if (err) {
        console.error("❌ Error creating sensor_data table:", err.message);
    } else {
        console.log("✅ Table sensor_data created or already exists.");
    }
});

// ✅ Sensor Definitions
const sensors = [
    { id: 1, name: "Temperature Sensor", objectId: "System1:TempSensor1", propertyName: "Value" },
    { id: 2, name: "CO2 Sensor", objectId: "System1:CO2Sensor1", propertyName: "Value" },
    { id: 3, name: "Humidity Sensor", objectId: "System1:HumiditySensor1", propertyName: "Value" },
    { id: 4, name: "Pressure Sensor", objectId: "System1:PressureSensor1", propertyName: "Value" },
    { id: 5, name: "Air Quality Sensor", objectId: "System1:AirQualitySensor1", propertyName: "Value" },
    { id: 6, name: "Water Flow Sensor", objectId: "System1:WaterFlowSensor1", propertyName: "Value" },
];

// ✅ Generate Correct Sensor Value Format
const generateSensorValue = (sensor) => {
    return {
        sensor_id: sensor.id,
        data_type: "BasicFloat",
        value: (Math.random() * 100).toFixed(2),
        quality: Math.floor(Math.random() * 10000000000000000000).toString(),
        quality_good: Math.random() > 0.2, // 80% chance of being "good"
        timestamp: new Date().toISOString(),
        original_object_property_id: `${sensor.objectId}.${sensor.propertyName}`,
        object_id: sensor.objectId,
        property_name: sensor.propertyName,
        attribute_id: `${sensor.objectId}.${sensor.propertyName}:_online.._value`,
        error_code: 0,
        is_array: false,
    };
};

// ✅ Insert 100 rows per sensor (Total: 600 rows)
const insertDataSQL = `
    INSERT INTO sensor_data (sensor_id, data_type, value, quality, quality_good, timestamp,
                             original_object_property_id, object_id, property_name,
                             attribute_id, error_code, is_array)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
`;

db.serialize(() => {
    const stmt = db.prepare(insertDataSQL);
    sensors.forEach(sensor => {
        for (let i = 0; i < 100; i++) {
            const data = generateSensorValue(sensor);
            stmt.run(
                data.sensor_id, data.data_type, data.value, data.quality, data.quality_good,
                data.timestamp, data.original_object_property_id, data.object_id,
                data.property_name, data.attribute_id, data.error_code, data.is_array
            );
        }
    });

    stmt.finalize(() => {
        console.log("✅ 600 rows of sensor data inserted.");
    });

    // ✅ Insert Dummy Expired Token for Testing (You can remove this later)
    db.run(
        `INSERT INTO DesigoAuthTokens (token, expires_at) VALUES (?, DATETIME('now', '-1 hours'))`,
        ["expired_test_token"],
        (err) => {
            if (err) {
                console.error("❌ Error inserting test token:", err.message);
            } else {
                console.log("✅ Dummy expired token inserted for testing.");
            }
        }
    );

    db.close();
});
