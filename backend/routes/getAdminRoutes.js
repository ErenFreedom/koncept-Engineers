const express = require("express");
const router = express.Router();
const { getAdminProfile } = require("../controllers/getAdminProfile");

// Route: GET /api/admin/profile/:adminId
router.get("/admin/profile/:adminId", getAdminProfile);

module.exports = router;
