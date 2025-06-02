const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); 
const db = require('./db/connector'); 
const cookieParser = require('cookie-parser');



dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;


app.use(cors({
    origin: "http://ec2-98-84-241-148.compute-1.amazonaws.com", 
    credentials: true, 
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization"
  }));
  


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



const adminRoutes = require("./routes/adminRoutes");
const staffRoutes = require("./routes/staffRoutes");
const adminAuthRoutes = require("./routes/authAdminRoutes");
const staffAuthRoutes = require("./routes/authStaffRoutes");
const appAuthRoutes = require("./routes/appAuthRoutes");
const staffAppAuthRoutes = require("./routes/authStaffAppRoutes");
const desigoAuthRoutes = require("./routes/desigoAuthRoutes");
const sensorRoutes = require("./routes/sensorRoutes");
const activateSensorRoutes = require("./routes/activateSensorRoutes");
const listSensorsRoutes = require("./routes/listSensorsRoutes");
const sensorDataRoutes = require("./routes/sensorDataCloudRoutes");
const displayRoutes = require("./routes/displayRoutes");
const getAdminRoutes = require("./routes/getAdminRoutes")
const editProfileRoutes = require("./routes/editProfileRoutes");
const syncDbRoutes = require("./routes/syncDbRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const floorRoomRoutes = require("./routes/floorRoomRoutes");
const floorRoomFetchRoutes = require("./routes/floorRoomFetchRoutes");
const subSiteRoutes = require("./routes/subSiteRoutes");
const subsiteFloorRoomRoutes = require("./routes/subsiteFloorRoomRoutes");
const subsiteFloorRoomFetchRoutes = require("./routes/subsiteFloorRoomFetchRoutes");
const subSiteSensorRoutes = require("./routes/subsiteSensorRoutes");
const subsiteSensorActivationRoutes = require("./routes/subsiteSensorActivationRoutes");
const subsiteSyncRoutes = require("./routes/subsiteSyncRoutes");


app.use("/api/admin", adminRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/staff/auth", staffAuthRoutes);
app.use("/api/app/auth", appAuthRoutes);
app.use("/api/staff/app/auth", staffAppAuthRoutes); 
app.use("/api/desigo/auth", desigoAuthRoutes);
app.use("/api/sensor-bank", sensorRoutes);
app.use("/api/sensors", activateSensorRoutes); 
app.use("/api/sensors", listSensorsRoutes);
app.use("/api/sensor-data", sensorDataRoutes);
app.use("/api", displayRoutes);
app.use("/api", getAdminRoutes);
app.use("/api", editProfileRoutes);
app.use("/api/cloud", syncDbRoutes);
app.use("/api", sessionRoutes);
app.use("/api", floorRoomRoutes);
app.use("/api", floorRoomFetchRoutes);
app.use("/api", subSiteRoutes);
app.use("/api/subsite/floor-room", subsiteFloorRoomRoutes);
app.use("/api/subsite", subsiteFloorRoomFetchRoutes);
app.use("/api/subsite/sensor", subSiteSensorRoutes);
app.use("/api/subsite/sensor/activation", subsiteSensorActivationRoutes);
app.use("/api/subsite/cloud", subsiteSyncRoutes);






(async () => {
    try {
        await db.query('SELECT 1'); 
        console.log('✅ Connected to the database successfully!');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1); 
    }
})();


app.get('/', (req, res) => {
    res.status(200).json({ message: 'Server is running!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
