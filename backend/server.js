const express = require('express');
const dotenv = require('dotenv');
const db = require('./db/connector'); // Adjust path as per your folder structure

// Load environment variables from .env file
dotenv.config();

// Import routes
const adminRoutes = require("./routes/adminRoutes");
const staffRoutes = require("./routes/staffRoutes");
const adminAuthRoutes = require("./routes/authAdminRoutes");
const staffAuthRoutes = require("./routes/authStaffRoutes");
const appAuthRoutes = require("./routes/appAuthRoutes");
const staffAppAuthRoutes = require("./routes/authStaffAppRoutes");
const desigoAuthRoutes = require("./routes/desigoAuthRoutes");

const app = express();
const PORT = process.env.PORT || 3001;


// Middleware to parse JSON requests
app.use(express.json());


//Use Routes
app.use("/api/admin", adminRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/staff/auth", staffAuthRoutes);
app.use("/api/app/auth", appAuthRoutes);
app.use("/api/staff/app/auth", staffAppAuthRoutes); 
app.use("/api/desigo/auth", desigoAuthRoutes);



// Test database connection
(async () => {
    try {
        await db.query('SELECT 1'); // Simple query to check DB connection
        console.log('Connected to the database successfully!');
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1); // Exit the process if DB connection fails
    }
})();

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Server is running!' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
