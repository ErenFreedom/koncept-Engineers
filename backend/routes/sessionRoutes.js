const express = require("express");
const router = express.Router();
const redisClient = require("../redisClient");



router.get("/admin/active-sessions", async (req, res) => {
  try {
    const keys = await redisClient.keys("admin:*");
    const sessions = [];

    for (const key of keys) {
      const data = await redisClient.get(key);
      if (data) {
        sessions.push({ key, ...JSON.parse(data) });
      }
    }

    res.json({ activeSessions: sessions });
  } catch (err) {
    console.error("❌ Error listing Redis sessions:", err);
    res.status(500).json({ message: "Failed to retrieve sessions" });
  }
});

module.exports = router;
