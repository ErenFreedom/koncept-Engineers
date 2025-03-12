const axios = require("axios");
require("dotenv").config();

/** ✅ Middleware to Verify Admin or Staff Token */
const verifyAuthToken = async (req, res, next) => {
    try {
        const accessToken = req.headers.authorization?.split(" ")[1]; // Extract Bearer Token

        if (!accessToken) {
            return res.status(401).json({ message: "Unauthorized: Token missing" });
        }

        const cloudApiUrl = `${process.env.CLOUD_API_URL}/api/app/auth/verify-token`;

        // ✅ Validate Token via Cloud API
        const response = await axios.post(cloudApiUrl, { token: accessToken });

        req.user = response.data; // Attach user info to request object
        next();
    } catch (error) {
        console.error("❌ Authentication failed:", error.response?.data || error.message);
        res.status(403).json({ message: "Forbidden: Invalid or expired token" });
    }
};

module.exports = { verifyAuthToken };
