const axios = require("axios");
require("dotenv").config();

/** ✅ Authenticate Staff via Cloud API */
const authenticateStaff = async (req, res) => {
    try {
        const { staffIdentifier, adminIdentifier, otp, rememberMe } = req.body;

        if (!staffIdentifier || !adminIdentifier || !otp) {
            return res.status(400).json({ message: "Staff and Admin identifiers with OTP are required" });
        }

        const cloudApiUrl = `${process.env.CLOUD_API_URL}/api/staff/app/auth/verify-otp`;

        const response = await axios.post(cloudApiUrl, {
            staffIdentifier,
            adminIdentifier,
            otp,
            rememberMe
        });

        res.status(response.status).json(response.data);
    } catch (error) {
        console.error("❌ Error authenticating Staff:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            message: "Failed to authenticate Staff",
            error: error.response?.data || error.message
        });
    }
};

module.exports = { authenticateStaff };
