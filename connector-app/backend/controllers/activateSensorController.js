const axios = require("axios");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
require("dotenv").config();

// ✅ Local Database Path
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

/** ✅ Activate Sensor (Connector Sends Request to Cloud) */
const activateSensor = async (req, res) => {
    try {
        const { sensorId } = req.body; // 🔹 Get sensorId from request

        if (!sensorId) {
            return res.status(400).json({ message: "Sensor ID is required" });
        }

        // ✅ Fetch stored JWT from local DB
        let token;
        try {
            token = await getStoredToken();
            console.log(`🔍 Using Token: ${token}`);
        } catch (error) {
            return res.status(401).json({ message: "Unauthorized: Token missing or invalid" });
        }

        // ✅ Send activation request to Cloud Backend
        const cloudApiUrl = `${process.env.CLOUD_API_URL}/api/sensors/activate`;
        console.log(`📤 Activating Sensor in Cloud: ${cloudApiUrl}`);

        try {
            const cloudResponse = await axios.post(cloudApiUrl, { sensorId }, { headers: { Authorization: `Bearer ${token}` } });
            console.log("✅ Sensor activated successfully in Cloud:", cloudResponse.data);
            res.status(200).json({ message: "Sensor activated successfully", cloudResponse: cloudResponse.data });
        } catch (error) {
            console.error("❌ Failed to activate sensor in Cloud:", error.response?.data || error.message);
            res.status(500).json({ message: "Failed to activate sensor in Cloud", error: error.response?.data || error.message });
        }
    } catch (error) {
        console.error("❌ Error activating sensor:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

/** ✅ Deactivate Sensor (Connector Sends Request to Cloud) */
const deactivateSensor = async (req, res) => {
    try {
        const { sensorId } = req.body; // 🔹 Get sensorId from request

        if (!sensorId) {
            return res.status(400).json({ message: "Sensor ID is required" });
        }

        // ✅ Fetch stored JWT from local DB
        let token;
        try {
            token = await getStoredToken();
            console.log(`🔍 Using Token: ${token}`);
        } catch (error) {
            return res.status(401).json({ message: "Unauthorized: Token missing or invalid" });
        }

        // ✅ Send deactivation request to Cloud Backend
        const cloudApiUrl = `${process.env.CLOUD_API_URL}/api/sensor/deactivate`;
        console.log(`📤 Deactivating Sensor in Cloud: ${cloudApiUrl}`);

        try {
            const cloudResponse = await axios.post(cloudApiUrl, { sensorId }, { headers: { Authorization: `Bearer ${token}` } });
            console.log("✅ Sensor deactivated successfully in Cloud:", cloudResponse.data);
            res.status(200).json({ message: "Sensor deactivated successfully", cloudResponse: cloudResponse.data });
        } catch (error) {
            console.error("❌ Failed to deactivate sensor in Cloud:", error.response?.data || error.message);
            res.status(500).json({ message: "Failed to deactivate sensor in Cloud", error: error.response?.data || error.message });
        }
    } catch (error) {
        console.error("❌ Error deactivating sensor:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

/** ✅ Remove Sensor (Connector Sends Request to Cloud) */
const removeActiveSensor = async (req, res) => {
    try {
        const { sensorId } = req.body; // 🔹 Get sensorId from request

        if (!sensorId) {
            return res.status(400).json({ message: "Sensor ID is required" });
        }

        // ✅ Fetch stored JWT from local DB
        let token;
        try {
            token = await getStoredToken();
            console.log(`🔍 Using Token: ${token}`);
        } catch (error) {
            return res.status(401).json({ message: "Unauthorized: Token missing or invalid" });
        }

        // ✅ Send removal request to Cloud Backend
        const cloudApiUrl = `${process.env.CLOUD_API_URL}/api/sensor/remove`;
        console.log(`📤 Removing Sensor from Active in Cloud: ${cloudApiUrl}`);

        try {
            const cloudResponse = await axios.post(cloudApiUrl, { sensorId }, { headers: { Authorization: `Bearer ${token}` } });
            console.log("✅ Sensor removed successfully from Active Sensors in Cloud:", cloudResponse.data);
            res.status(200).json({ message: "Sensor removed successfully", cloudResponse: cloudResponse.data });
        } catch (error) {
            console.error("❌ Failed to remove sensor in Cloud:", error.response?.data || error.message);
            res.status(500).json({ message: "Failed to remove sensor in Cloud", error: error.response?.data || error.message });
        }
    } catch (error) {
        console.error("❌ Error removing sensor:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

/** ✅ Export Functions */
module.exports = { activateSensor, deactivateSensor, removeActiveSensor };
