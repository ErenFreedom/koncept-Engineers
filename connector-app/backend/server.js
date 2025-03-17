const express = require('express');
const dotenv = require('dotenv');
const db = require('./db/localDB'); // Import Local Database for storing tokens

dotenv.config();

// Import routes
const cloudAdminAuthRoutes = require("./routes/cloudAdminAuthRoutes");
const cloudStaffAuthRoutes = require("./routes/cloudStaffAuthRoutes");
const sensorRoutes = require("./routes/sensorRoutes");
const activateSensorRoutes = require("./routes/activateSensorRoutes"); 
const syncSensorIdsRoutes = require("./routes/syncSensorIdsRoutes");
const sensorDataRoutes = require("./routes/sensorDataRoutes");
const fetchSensorDataRoutes = require("./routes/fetchSensorDataRoutes");

const app = express();
const PORT = process.env.PORT || 5004;

// Middleware to parse JSON requests
app.use(express.json());

// Use Routes
app.use("/api/admin/auth", cloudAdminAuthRoutes);
app.use("/api/staff/auth", cloudStaffAuthRoutes);
app.use("/api/sensor", sensorRoutes);
app.use("/api/sensors", activateSensorRoutes);
app.use("/api", syncSensorIdsRoutes);
app.use("/api/local", sensorDataRoutes);
app.use("/api/local", fetchSensorDataRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Connector App Backend is running!' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`✅ Connector App Backend is running on http://localhost:${PORT}`);
});
