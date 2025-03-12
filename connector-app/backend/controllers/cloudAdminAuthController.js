const axios = require("axios");
require("dotenv").config();

/** ✅ Authenticate Admin via Cloud API */
const authenticateAdmin = async (req, res) => {
    try {
        const { identifier, otp, rememberMe } = req.body;

        if (!identifier || !otp) {
            return res.status(400).json({ message: "Identifier and OTP are required" });
        }

        const cloudApiUrl = `${process.env.CLOUD_API_URL}/api/admin/auth/verify-otp`;

        const response = await axios.post(cloudApiUrl, {
            identifier,
            otp,
            rememberMe
        });

        res.status(response.status).json(response.data);
    } catch (error) {
        console.error("❌ Error authenticating Admin:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            message: "Failed to authenticate Admin",
            error: error.response?.data || error.message
        });
    }
};

module.exports = { authenticateAdmin };
