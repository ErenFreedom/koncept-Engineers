const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 8085; // Port for Desigo CC Server
app.use(cors()); // Enable CORS
app.use(express.json()); // Enable JSON parsing

// ✅ Sensor Definitions (6 fake sensors)
const sensors = [
    { id: 1, name: "Temperature Sensor", objectId: "System1:TempSensor1", propertyName: "Value" },
    { id: 2, name: "CO2 Sensor", objectId: "System1:CO2Sensor1", propertyName: "Value" },
    { id: 3, name: "Humidity Sensor", objectId: "System1:HumiditySensor1", propertyName: "Value" },
    { id: 4, name: "Pressure Sensor", objectId: "System1:PressureSensor1", propertyName: "Value" },
    { id: 5, name: "Air Quality Sensor", objectId: "System1:AirQualitySensor1", propertyName: "Value" },
    { id: 6, name: "Water Flow Sensor", objectId: "System1:WaterFlowSensor1", propertyName: "Value" },
];

// ✅ Generate random sensor values
const generateSensorValue = (sensor) => {
    let value = (Math.random() * 100).toFixed(2); // Random float between 0-100
    let qualityGood = Math.random() > 0.2; // 80% chance of being "good"
    let timestamp = new Date().toISOString();

    return {
        DataType: "BasicFloat",
        Value: {
            Value: value,
            Quality: Math.floor(Math.random() * 10000000000000000000), // Fake Quality ID
            QualityGood: qualityGood,
            Timestamp: timestamp,
        },
        OriginalObjectOrPropertyId: `${sensor.objectId}.${sensor.propertyName}`,
        ObjectId: sensor.objectId,
        PropertyName: sensor.propertyName,
        AttributeId: `${sensor.objectId}.${sensor.propertyName}:_online.._value`,
        ErrorCode: 0,
        IsArray: false
    };
};

// ✅ API Route for fetching data of each sensor
sensors.forEach(sensor => {
    app.get(`/api/sensor/${sensor.id}`, (req, res) => {
        res.json(generateSensorValue(sensor));
    });
});

// ✅ API Route for fetching **all sensors at once**
app.get("/api/sensors", (req, res) => {
    res.json(sensors.map(sensor => generateSensorValue(sensor)));
});

// ✅ Start the Dummy Server
app.listen(PORT, () => {
    console.log(`✅ Dummy Desigo CC Server running on http://localhost:${PORT}`);
});
