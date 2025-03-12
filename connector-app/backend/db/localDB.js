const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// ✅ Create or Open Local DB
const db = new sqlite3.Database(path.join(__dirname, "localDB.sqlite"), (err) => {
    if (err) console.error("❌ Error opening database:", err.message);
    else console.log("✅ Local database connected.");
});

// ✅ Create Token Storage Table
db.run(`CREATE TABLE IF NOT EXISTS AuthTokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`);

module.exports = db;
