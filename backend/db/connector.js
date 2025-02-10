const mysql = require('mysql2');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Create a connection pool to the database
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306, // Default MySQL port is 3306
    waitForConnections: true,          // Wait for available connections before throwing an error
    connectionLimit: 10,               // Max number of connections in the pool
    queueLimit: 0                      // Unlimited connection requests in queue
});

// Promisify the connection pool for better async/await handling
const db = pool.promise();

// Export the connection pool
module.exports = db;
