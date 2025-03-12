const axios = require("axios");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
require("dotenv").config();

// ✅ Open Local Database
const db = new sqlite3.Database(path.join(__dirname, "../localDB.sqlite"), (err) => {
    if (err) console.error("❌ Error opening database:", err.message);
});

/** ✅ Function to Fetch Token from Local DB */
const getStoredToken = () => {
    return new Promise((resolve, reject) => {
        db.get("SELECT token FROM AuthTokens ORDER BY id DESC LIMIT 1", [], (err, row) => {
            if (err) {
                reject("❌ Error fetching token: " + err.message);
            } else if (!row) {
                reject("❌ No stored token found.");
            } else {
                resolve(row.token);
            }
        });
    });
};

/** ✅ Add a Sensor (Connector Backend → Cloud Backend) */
const addSensor = async (req, res) => {
    try {
        const { sensorApi, sensorName, rateLimit } = req.body;

        if (!sensorApi || !sensorName || !rateLimit) {
            return res.status(400).json({ message: "Sensor API, name, and rate limit are required" });
        }

        // ✅ Fetch stored JWT from local DB
        let token;
        try {
            token = await getStoredToken();
        } catch (error) {
            return res.status(401).json({ message: "Unauthorized: Token missing or invalid" });
        }

        // ✅ Verify if the sensor API is accessible
        let sensorData;
        try {
            const response = await axios.get(sensorApi);
            sensorData = response.data;
        } catch (error) {
            return res.status(400).json({ message: "Invalid Sensor API. No response received." });
        }

        // ✅ Extract required fields from Desigo CC response
        const { DataType, Value, ObjectId, PropertyName } = sensorData;

        if (!DataType || !Value || !ObjectId || !PropertyName) {
            return res.status(400).json({ message: "Invalid sensor API response format" });
        }

        // ✅ Push Sensor to Cloud Backend
        const cloudApiUrl = `${process.env.CLOUD_API_URL}/api/sensor-bank/add`;
        const cloudResponse = await axios.post(
            cloudApiUrl,
            {
                sensorName,
                description: `Sensor added via Connector App`,
                objectId: ObjectId,
                propertyName: PropertyName,
                dataType: DataType,
                isActive: false, // Initially inactive
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (cloudResponse.status !== 200) {
            return res.status(500).json({ message: "Failed to add sensor to cloud" });
        }

        res.status(200).json({ message: "Sensor added successfully", cloudResponse: cloudResponse.data });

    } catch (error) {
        console.error("❌ Error adding sensor:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

/** ✅ Get All Sensors (Connector Fetches from Cloud) */
const getAllSensors = async (req, res) => {
    try {
        // ✅ Fetch stored JWT from local DB
        let token;
        try {
            token = await getStoredToken();
        } catch (error) {
            return res.status(401).json({ message: "Unauthorized: Token missing or invalid" });
        }

        const cloudApiUrl = `${process.env.CLOUD_API_URL}/api/sensor-bank/all`;
        const cloudResponse = await axios.get(cloudApiUrl, { headers: { Authorization: `Bearer ${token}` } });

        res.status(200).json({ sensors: cloudResponse.data });

    } catch (error) {
        console.error("❌ Error fetching sensors:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

/** ✅ Delete a Sensor (Connector Requests Cloud to Delete Sensor) */
const deleteSensor = async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ Fetch stored JWT from local DB
        let token;
        try {
            token = await getStoredToken();
        } catch (error) {
            return res.status(401).json({ message: "Unauthorized: Token missing or invalid" });
        }

        const cloudApiUrl = `${process.env.CLOUD_API_URL}/api/sensor-bank/delete/${id}`;
        const cloudResponse = await axios.delete(cloudApiUrl, { headers: { Authorization: `Bearer ${token}` } });

        res.status(200).json({ message: "Sensor deleted successfully", cloudResponse: cloudResponse.data });

    } catch (error) {
        console.error("❌ Error deleting sensor:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

module.exports = { addSensor, getAllSensors, deleteSensor };
