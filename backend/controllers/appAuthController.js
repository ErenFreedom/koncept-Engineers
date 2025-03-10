const db = require("../db/connector");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendOtpSms } = require("../utils/sendOtpSms");
const { sendOtpToEmail } = require("../utils/sendOtpEmail");

require("dotenv").config();

// ✅ Parse Token Config for Connector App
const TOKEN_CONFIG_APP = JSON.parse(process.env.TOKEN_CONFIG_APP || "{}");
const ACCESS_TOKEN_EXPIRY = TOKEN_CONFIG_APP.accessTokenExpiry || "6h";
const REFRESH_TOKEN_EXPIRY = TOKEN_CONFIG_APP.refreshTokenExpiry || "10y"; // Long-lived sessions for the app

const COOKIE_OPTIONS = {
    httpOnly: true,  
    secure: TOKEN_CONFIG_APP.cookieSecure !== undefined ? TOKEN_CONFIG_APP.cookieSecure : true,
    sameSite: "strict",
};

/** ✅ Send OTP for Admin App Login */
const sendAdminAppLoginOtp = async (req, res) => {
    try {
        const { identifier } = req.body; // Email or phone number

        if (!identifier) {
            return res.status(400).json({ message: "Identifier (email or phone) is required" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate OTP

        // ✅ Send OTP via Email or SMS
        let otpSent = { success: false };
        if (identifier.includes("@")) {
            otpSent = await sendOtpToEmail(identifier, otp);
        } else {
            otpSent = await sendOtpSms(identifier, otp);
        }

        if (!otpSent.success) {
            return res.status(500).json({ message: "Failed to send OTP", error: otpSent.error });
        }

        // ✅ Store OTP in a `AppLoginOtp` table
        await db.execute(
            `INSERT INTO AppLoginOtp (identifier, otp, created_at, expires_at)
             VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 10 MINUTE))
             ON DUPLICATE KEY UPDATE otp = ?, created_at = NOW(), expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE);`,
            [identifier, otp, otp]
        );

        res.status(200).json({ message: "OTP sent successfully" });

    } catch (error) {
        console.error("❌ Error sending OTP:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

/** ✅ Verify OTP & Authenticate Admin */
const verifyAdminAppLoginOtp = async (req, res) => {
    try {
        const { identifier, otp, rememberMe } = req.body;

        if (!identifier || !otp) {
            return res.status(400).json({ message: "Identifier and OTP are required" });
        }

        // ✅ Validate OTP
        const [otpResults] = await db.execute(
            `SELECT * FROM AppLoginOtp WHERE identifier = ? AND otp = ? AND expires_at > UTC_TIMESTAMP();`,
            [identifier, otp]
        );

        if (otpResults.length === 0) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // ✅ Fetch Admin Details (ONLY ADMIN)
        const [[admin]] = await db.execute(
            `SELECT id, email, phone_number FROM Admin WHERE email = ? OR phone_number = ?`,
            [identifier, identifier]
        );

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // ✅ Generate JWT Access & Refresh Tokens using `JWT_SECRET_APP`
        const accessToken = jwt.sign(
            { adminId: admin.id, email: admin.email },
            process.env.JWT_SECRET_APP,
            { expiresIn: ACCESS_TOKEN_EXPIRY }
        );

        const refreshToken = jwt.sign(
            { adminId: admin.id },
            process.env.JWT_SECRET_APP,
            { expiresIn: REFRESH_TOKEN_EXPIRY }
        );

        // ✅ Set Refresh Token in Secure HTTP-Only Cookie
        res.cookie("refreshToken", refreshToken, {
            ...COOKIE_OPTIONS,
            maxAge: rememberMe ? 10 * 365 * 24 * 60 * 60 * 1000 : null, // 10 years if "Remember Me" is checked
        });

        // ✅ Delete OTP after successful login
        await db.execute(`DELETE FROM AppLoginOtp WHERE identifier = ?`, [identifier]);

        res.status(200).json({ message: "Login successful", accessToken });

    } catch (error) {
        console.error("❌ Error verifying OTP:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

/** ✅ Refresh Access Token */
const refreshAdminAppToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) return res.status(401).json({ message: "Unauthorized" });

        // ✅ Verify Refresh Token
        jwt.verify(refreshToken, process.env.JWT_SECRET_APP, async (err, decoded) => {
            if (err) return res.status(403).json({ message: "Forbidden" });

            const [[admin]] = await db.execute(
                `SELECT id, email FROM Admin WHERE id = ?`,
                [decoded.adminId]
            );

            if (!admin) return res.status(404).json({ message: "Admin not found" });

            const newAccessToken = jwt.sign(
                { adminId: admin.id, email: admin.email },
                process.env.JWT_SECRET_APP,
                { expiresIn: ACCESS_TOKEN_EXPIRY }
            );

            res.status(200).json({ accessToken: newAccessToken });
        });

    } catch (error) {
        console.error("❌ Error refreshing token:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/** ✅ Logout Admin from Connector App */
const logoutAdminApp = async (req, res) => {
    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    res.status(200).json({ message: "Logged out successfully" });
};

module.exports = { sendAdminAppLoginOtp, verifyAdminAppLoginOtp, refreshAdminAppToken, logoutAdminApp };
