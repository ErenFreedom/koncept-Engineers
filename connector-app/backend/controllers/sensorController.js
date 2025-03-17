const axios = require("axios");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
require("dotenv").config();

// ✅ Ensure correct database path
const dbPath = path.resolve(__dirname, "../db/localDB.sqlite");
console.log(`📌 Using database path: ${dbPath}`);

// ✅ Open Local Database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error("❌ Error opening database:", err.message);
});

/** ✅ Function to Fetch Latest Token from Local DB */
const getStoredToken = () => {
    return new Promise((resolve, reject) => {
        db.get("SELECT token FROM AuthTokens ORDER BY id DESC LIMIT 1", [], (err, row) => {
            if (err) {
                console.error("❌ Error fetching token:", err.message);
                reject("Error fetching token from database");
            } else if (!row) {
                reject("No stored token found.");
            } else {
                resolve(row.token);
            }
        });
    });
};

/** ✅ Add a Sensor (Connector Backend → Cloud Backend + Local DB) */
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
            console.log(`🔍 Using Token: ${token}`);
        } catch (error) {
            return res.status(401).json({ message: "Unauthorized: Token missing or invalid" });
        }

        // ✅ Verify if the sensor API is accessible
        let sensorData;
        try {
            console.log(`🔍 Fetching Sensor Data from: ${sensorApi}`);
            const response = await axios.get(sensorApi);
            sensorData = response.data;
            console.log(`✅ Sensor Data Received:`, sensorData);
        } catch (error) {
            console.error("❌ Invalid Sensor API. No response received:", error.message);
            return res.status(400).json({ message: "Invalid Sensor API. No response received." });
        }

        // ✅ Check if the response is an array and extract the first element
        if (Array.isArray(sensorData)) {
            sensorData = sensorData[0]; // Take the first object from the array
        }

        // ✅ Extract required fields from Desigo CC response
        if (!sensorData || !sensorData.DataType || !sensorData.Value || !sensorData.ObjectId || !sensorData.PropertyName) {
            console.error("❌ Invalid sensor API response format:", sensorData);
            return res.status(400).json({ message: "Invalid sensor API response format" });
        }

        const { DataType, ObjectId, PropertyName } = sensorData;

        // ✅ Push Sensor to Cloud Backend
        const cloudApiUrl = `${process.env.CLOUD_API_URL}/api/sensor-bank/add`;
        console.log(`📤 Sending Sensor Data to Cloud: ${cloudApiUrl}`);

        let cloudResponse;
        try {
            cloudResponse = await axios.post(
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

            console.log("✅ Sensor added successfully to Cloud:", cloudResponse.data);
        } catch (error) {
            console.error("❌ Failed to add sensor to cloud:", error.response?.data || error.message);
            return res.status(500).json({ message: "Failed to add sensor to cloud", error: error.response?.data || error.message });
        }

        // ✅ Insert Sensor into Local Databases (`LocalSensorBank` & `LocalSensorAPIs`)
        db.serialize(() => {
            const insertSensorQuery = `
                INSERT INTO LocalSensorBank (name, description, object_id, property_name, data_type, is_active)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            db.run(insertSensorQuery, [sensorName, "Sensor added via Connector App", ObjectId, PropertyName, DataType, 0], function (err) {
                if (err) {
                    console.error("❌ Error inserting sensor into Local DB:", err.message);
                } else {
                    console.log(`✅ Sensor ${sensorName} added to Local DB.`);

                    // ✅ Insert into `LocalSensorAPIs`
                    const insertApiQuery = `
                        INSERT INTO LocalSensorAPIs (sensor_id, api_endpoint) VALUES (?, ?)
                    `;
                    db.run(insertApiQuery, [this.lastID, sensorApi], (err) => {
                        if (err) console.error("❌ Error inserting API into Local DB:", err.message);
                        else console.log(`✅ API for Sensor ${sensorName} stored in Local DB.`);
                    });
                }
            });
        });

        res.status(200).json({ message: "Sensor added successfully", cloudResponse: cloudResponse.data });
    } catch (error) {
        console.error("❌ Error adding sensor:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


/** ✅ Delete a Sensor (Connector Requests Cloud to Delete + Remove from Local DB) */
const deleteSensor = async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ Fetch stored JWT from local DB
        let token;
        try {
            token = await getStoredToken();
            console.log(`🔍 Using Token: ${token}`);
        } catch (error) {
            return res.status(401).json({ message: "Unauthorized: Token missing or invalid" });
        }

        const cloudApiUrl = `${process.env.CLOUD_API_URL}/api/sensor-bank/delete/${id}`;
        console.log(`🗑 Deleting Sensor from Cloud: ${cloudApiUrl}`);

        let cloudResponse;
        try {
            cloudResponse = await axios.delete(cloudApiUrl, { headers: { Authorization: `Bearer ${token}` } });
            console.log("✅ Sensor deleted successfully from Cloud:", cloudResponse.data);
        } catch (error) {
            console.error("❌ Error deleting sensor from cloud:", error.response?.data || error.message);
            return res.status(500).json({ message: "Failed to delete sensor from cloud", error: error.response?.data || error.message });
        }

        // ✅ Delete Sensor from Local Databases (`LocalSensorBank` & `LocalSensorAPIs`)
        db.serialize(() => {
            const deleteSensorQuery = `DELETE FROM LocalSensorBank WHERE id = ?`;
            db.run(deleteSensorQuery, [id], (err) => {
                if (err) {
                    console.error("❌ Error deleting sensor from Local DB:", err.message);
                } else {
                    console.log(`✅ Sensor ${id} deleted from Local DB.`);

                    // ✅ Delete from `LocalSensorAPIs`
                    const deleteApiQuery = `DELETE FROM LocalSensorAPIs WHERE sensor_id = ?`;
                    db.run(deleteApiQuery, [id], (err) => {
                        if (err) console.error("❌ Error deleting API from Local DB:", err.message);
                        else console.log(`✅ API for Sensor ${id} deleted from Local DB.`);
                    });
                }
            });
        });

        res.status(200).json({ message: "Sensor deleted successfully", cloudResponse: cloudResponse.data });
    } catch (error) {
        console.error("❌ Error deleting sensor:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

/** ✅ Get All Sensors (Connector Fetches from Cloud Only) */
const getAllSensors = async (req, res) => {
    try {
        // ✅ Fetch stored JWT from local DB
        let token;
        try {
            token = await getStoredToken();
            console.log(`🔍 Using Token: ${token}`);
        } catch (error) {
            return res.status(401).json({ message: "Unauthorized: Token missing or invalid" });
        }

        const cloudApiUrl = `${process.env.CLOUD_API_URL}/api/sensor-bank/all`;
        console.log(`📤 Fetching Sensors from Cloud: ${cloudApiUrl}`);

        try {
            const cloudResponse = await axios.get(cloudApiUrl, { headers: { Authorization: `Bearer ${token}` } });
            console.log("✅ Sensors received from Cloud:", cloudResponse.data);
            res.status(200).json({ sensors: cloudResponse.data });
        } catch (error) {
            console.error("❌ Error fetching sensors from cloud:", error.response?.data || error.message);
            res.status(500).json({ message: "Failed to fetch sensors from cloud", error: error.response?.data || error.message });
        }
    } catch (error) {
        console.error("❌ Error fetching sensors:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

module.exports = { addSensor, getAllSensors, deleteSensor };
