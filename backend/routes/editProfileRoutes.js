// routes/editProfileRoutes.js
const express = require("express");
const router = express.Router();
const { updateAdminProfile } = require("../controllers/updateAdminProfile");

// Route: PUT /api/admin/profile/edit/:adminId
router.put("/admin/profile/edit/:adminId", updateAdminProfile);

module.exports = router;
