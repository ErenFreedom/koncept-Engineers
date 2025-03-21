const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 8085; // Dummy Desigo CC Server Port
const SECRET_KEY = "desigo_secret"; // Change this to a strong secret key

app.use(cors()); // ✅ Enable CORS
app.use(express.json()); // ✅ Enable JSON parsing

// ✅ **Connect to SQLite database**
const db = new sqlite3.Database("./desigo_sensors.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error("❌ Error opening database:", err.message);
    } else {
        console.log("✅ Connected to SQLite database.");
    }
});

// ✅ **Middleware to Validate Token for Protected Routes**
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ error: "Unauthorized: No Token Provided" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: "Forbidden: Invalid Token" });

        req.user = user; // Store user data in request
        next();
    });
};

// ✅ **Login Route (Returns JWT Token)**
app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;

    if (username === "admin" && password === "passwd") {
        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "6h" });

        console.log("✅ Token issued:", token);
        res.json({ token });
    } else {
        res.status(401).json({ error: "Invalid username or password" });
    }
});

// ✅ **Protected Route: Fetch Latest Sensor Data**
app.get("/api/sensor/:id", authenticateToken, (req, res) => {
    const sensorId = req.params.id;
    const query = `
        SELECT * FROM sensor_data 
        WHERE sensor_id = ? 
        ORDER BY timestamp DESC 
        LIMIT 1;
    `;

    db.get(query, [sensorId], (err, row) => {
        if (err) {
            console.error(`❌ Error fetching sensor ${sensorId}:`, err.message);
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: "Sensor not found" });
        }

        // ✅ **Convert Database Row to Real API Format**
        const responseData = [
            {
                DataType: row.data_type,
                Value: {
                    Value: row.value,
                    Quality: row.quality,
                    QualityGood: row.quality_good === 1, // Convert to Boolean
                    Timestamp: row.timestamp
                },
                OriginalObjectPropertyId: row.original_object_property_id,
                ObjectId: row.object_id,
                PropertyName: row.property_name,
                AttributeId: row.attribute_id,
                ErrorCode: row.error_code,
                IsArray: Boolean(row.is_array)
            }
        ];

        res.json(responseData);
    });
});

// ✅ **Protected Route: Fetch Last 10 Sensor Readings**
app.get("/api/sensors", authenticateToken, (req, res) => {
    const query = `
        SELECT * FROM (
            SELECT *, ROW_NUMBER() OVER (PARTITION BY sensor_id ORDER BY timestamp DESC) AS rn
            FROM sensor_data
        ) WHERE rn <= 10;  -- Last 10 entries per sensor
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error("❌ Error fetching sensors:", err.message);
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// ✅ **Protected Route: Add a Sensor**
app.post("/api/sensor/add", authenticateToken, (req, res) => {
    const { sensorId, value, timestamp } = req.body;

    if (!sensorId || !value || !timestamp) {
        return res.status(400).json({ error: "Missing sensor parameters" });
    }

    const query = `INSERT INTO sensor_data (sensor_id, value, timestamp) VALUES (?, ?, ?)`;
    db.run(query, [sensorId, value, timestamp], (err) => {
        if (err) {
            console.error("❌ Error adding sensor data:", err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log("✅ Sensor data added successfully!");
        res.status(200).json({ message: "Sensor data added successfully!" });
    });
});

// ✅ **Protected Route: Delete a Sensor**
app.delete("/api/sensor/:id", authenticateToken, (req, res) => {
    const sensorId = req.params.id;

    const query = `DELETE FROM sensor_data WHERE sensor_id = ?`;
    db.run(query, [sensorId], (err) => {
        if (err) {
            console.error("❌ Error deleting sensor:", err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log(`✅ Sensor ${sensorId} deleted successfully.`);
        res.status(200).json({ message: `Sensor ${sensorId} deleted successfully.` });
    });
});

// ✅ Start the Dummy Server
app.listen(PORT, () => {
    console.log(`✅ Dummy Desigo CC Server running on http://localhost:${PORT}`);
});
