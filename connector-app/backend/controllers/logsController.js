const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "../db/localDB.sqlite");
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE);

const getSensorLogStatus = (req, res) => {
  const { sensor_id } = req.query;

  if (!sensor_id) {
    return res.status(400).json({ message: "Sensor ID is required." });
  }

  db.get(
    `SELECT is_fetching, is_sending FROM IntervalControl WHERE sensor_id = ?`,
    [sensor_id],
    (err, row) => {
      if (err) {
        console.error("❌ Error fetching sensor log status:", err.message);
        return res.status(500).json({ message: "Database error." });
      }

      if (!row) {
        return res.status(404).json({ message: "No status found for this sensor." });
      }

      return res.status(200).json({
        sensor_id,
        is_fetching: row.is_fetching === 1,
        is_sending: row.is_sending === 1,
      });
    }
  );
};

module.exports = { getSensorLogStatus };
