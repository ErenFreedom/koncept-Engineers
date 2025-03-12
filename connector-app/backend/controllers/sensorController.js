const axios = require("axios");
require("dotenv").config();

/** ✅ Add a Sensor (Connector Backend → Cloud Backend) */
const addSensor = async (req, res) => {
    try {
        const { sensorApi, sensorName, rateLimit } = req.body;
        const { adminId, companyId, email } = req.user; // Extracted from Token

        if (!sensorApi || !sensorName || !rateLimit) {
            return res.status(400).json({ message: "Sensor API, name, and rate limit are required" });
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
        const cloudResponse = await axios.post(cloudApiUrl, {
            sensorName,
            description: `Sensor added by ${email}`,
            objectId: ObjectId,
            propertyName: PropertyName,
            dataType: DataType,
            isActive: false, // Initially inactive
            companyId,
            adminId
        });

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
        const { companyId } = req.user;

        const cloudApiUrl = `${process.env.CLOUD_API_URL}/api/sensor-bank/${companyId}`;
        const cloudResponse = await axios.get(cloudApiUrl);

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
        const { companyId } = req.user;

        const cloudApiUrl = `${process.env.CLOUD_API_URL}/api/sensor-bank/delete/${id}`;
        const cloudResponse = await axios.delete(cloudApiUrl);

        res.status(200).json({ message: "Sensor deleted successfully", cloudResponse: cloudResponse.data });

    } catch (error) {
        console.error("❌ Error deleting sensor:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

module.exports = { addSensor, getAllSensors, deleteSensor };
