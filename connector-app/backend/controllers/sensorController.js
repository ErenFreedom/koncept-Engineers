const db = require("../db/localdb"); // SQLite local DB
const axios = require("axios");

/** ✅ Add New Sensor */
const addSensor = async (req, res) => {
    try {
        const { sensorName, sensorApiUrl, requestRate, isRealTime } = req.body;

        if (!sensorName || !sensorApiUrl || requestRate === undefined || isRealTime === undefined) {
            return res.status(400).json({ message: "Missing required sensor details" });
        }

        // ✅ Verify if Sensor Exists in Desigo CC
        try {
            const response = await axios.get(sensorApiUrl);
            if (!response.data || !response.data.ObjectId) {
                return res.status(400).json({ message: "Invalid sensor API response" });
            }
        } catch (error) {
            return res.status(500).json({ message: "Failed to verify sensor with Desigo CC", error: error.message });
        }

        // ✅ Insert into Local Database
        await db.run(
            `INSERT INTO SensorBank (name, api_url, request_rate, is_real_time, is_active) 
             VALUES (?, ?, ?, ?, ?)`,
            [sensorName, sensorApiUrl, requestRate, isRealTime, 0] // Sensor starts as inactive
        );

        res.status(201).json({ message: "Sensor added successfully" });

    } catch (error) {
        console.error("❌ Error adding sensor:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

/** ✅ Fetch All Sensors */
const getAllSensors = async (req, res) => {
    try {
        const sensors = await db.all("SELECT * FROM SensorBank");
        res.status(200).json(sensors);
    } catch (error) {
        console.error("❌ Error fetching sensors:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/** ✅ Delete a Sensor */
const deleteSensor = async (req, res) => {
    try {
        const { id } = req.params;
        await db.run("DELETE FROM SensorBank WHERE id = ?", [id]);
        res.status(200).json({ message: "Sensor deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting sensor:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { addSensor, getAllSensors, deleteSensor };
