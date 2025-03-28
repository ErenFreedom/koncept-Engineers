const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

// ✅ Detect if we are inside the Electron packaged app
let isProd = false;
try {
  isProd = require("electron").app.isPackaged;
} catch (_) {}

// ✅ Paths
const dbDir = path.join(__dirname); // /backend/db
const finalDBPath = isProd
  ? path.join(process.resourcesPath, "db", "localDB.sqlite")
  : path.join(dbDir, "localDB.sqlite");

const templatePath = path.join(dbDir, "cleaned_localDB.sqlite");

// ✅ Detect if running inside a Docker container
const isDocker = fs.existsSync("/.dockerenv");

// ✅ Docker: Always reset with cleaned DB
if (isDocker) {
  if (fs.existsSync(finalDBPath)) {
    fs.unlinkSync(finalDBPath);
    console.log("🗑️ [Docker] Removed old localDB.sqlite");
  }

  fs.copyFileSync(templatePath, finalDBPath);
  console.log("📦 [Docker] Copied cleaned_localDB.sqlite as localDB.sqlite");
} else {
  // ✅ Local: Only copy if DB doesn't exist
  if (!fs.existsSync(finalDBPath)) {
    fs.copyFileSync(templatePath, finalDBPath);
    console.log("📦 [Local] Copied cleaned_localDB.sqlite as localDB.sqlite");
  }
}

// ✅ Connect to DB
const db = new sqlite3.Database(finalDBPath, (err) => {
  if (err) console.error("❌ Error opening database:", err.message);
  else console.log("✅ Local database connected.");
});

module.exports = db;
