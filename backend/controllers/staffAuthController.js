const db = require("../db/connector");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendOtpSms } = require("../utils/sendOtpSms");
const { sendOtpToEmail } = require("../utils/sendOtpEmail");

require("dotenv").config();

// ✅ Parse Token Config from ENV
const TOKEN_CONFIG = JSON.parse(process.env.TOKEN_CONFIG || "{}");
const ACCESS_TOKEN_EXPIRY = TOKEN_CONFIG.accessTokenExpiry || "6h";
const REFRESH_TOKEN_EXPIRY = TOKEN_CONFIG.refreshTokenExpiry || "30d";

const COOKIE_OPTIONS = {
    httpOnly: true,  // Prevent JavaScript access (XSS protection)
    secure: TOKEN_CONFIG.cookieSecure !== undefined ? TOKEN_CONFIG.cookieSecure : true,
    sameSite: "strict", // Prevent CSRF attacks
};

/** ✅ Send OTP for Staff Login */
const sendStaffLoginOtp = async (req, res) => {
    try {
        const { identifier } = req.body; // Can be email or phone number

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

        // ✅ Store OTP in a `LoginOtp` table
        await db.execute(
            `INSERT INTO LoginOtp (identifier, otp, created_at, expires_at)
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

/** ✅ Verify OTP & Authenticate Staff */
const verifyStaffLoginOtp = async (req, res) => {
    try {
        const { identifier, otp, rememberMe } = req.body;

        if (!identifier || !otp) {
            return res.status(400).json({ message: "Identifier and OTP are required" });
        }

        // ✅ Validate OTP
        const [otpResults] = await db.execute(
            `SELECT * FROM LoginOtp WHERE identifier = ? AND otp = ? AND expires_at > UTC_TIMESTAMP();`,
            [identifier, otp]
        );

        if (otpResults.length === 0) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // ✅ Fetch Staff Details
        const [[staff]] = await db.execute(
            `SELECT id, first_name, last_name, phone_number, email, company_id, nationality, position 
             FROM Staff WHERE email = ? OR phone_number = ?`,
            [identifier, identifier]
        );

        if (!staff) {
            return res.status(404).json({ message: "Staff member not found" });
        }

        // ✅ Generate JWT Access & Refresh Tokens
        const accessToken = jwt.sign(
            { 
                staffId: staff.id,
                firstName: staff.first_name,
                lastName: staff.last_name,
                phoneNumber: staff.phone_number,
                email: staff.email,
                companyId: staff.company_id,
                nationality: staff.nationality,
                position: staff.position
            },
            process.env.JWT_SECRET,
            { expiresIn: ACCESS_TOKEN_EXPIRY }
        );

        const refreshToken = jwt.sign(
            { staffId: staff.id },
            process.env.JWT_SECRET,
            { expiresIn: REFRESH_TOKEN_EXPIRY }
        );

        // ✅ Set Refresh Token in Secure HTTP-Only Cookie
        res.cookie("refreshToken", refreshToken, {
            ...COOKIE_OPTIONS,
            maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : null, // 30 days if "Remember Me" is checked
        });

        // ✅ Delete OTP after successful login
        await db.execute(`DELETE FROM LoginOtp WHERE identifier = ?`, [identifier]);

        res.status(200).json({ 
            message: "Login successful", 
            accessToken,
            staff: {
                id: staff.id,
                firstName: staff.first_name,
                lastName: staff.last_name,
                phoneNumber: staff.phone_number,
                email: staff.email,
                companyId: staff.company_id,
                nationality: staff.nationality,
                position: staff.position
            }
        });

    } catch (error) {
        console.error("❌ Error verifying OTP:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

/** ✅ Refresh Access Token */
const refreshStaffToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) return res.status(401).json({ message: "Unauthorized" });

        // ✅ Verify Refresh Token
        jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) return res.status(403).json({ message: "Forbidden" });

            const [[staff]] = await db.execute(
                `SELECT id, first_name, last_name, phone_number, email, company_id, nationality, position 
                 FROM Staff WHERE id = ?`,
                [decoded.staffId]
            );

            if (!staff) return res.status(404).json({ message: "Staff member not found" });

            const newAccessToken = jwt.sign(
                { 
                    staffId: staff.id,
                    firstName: staff.first_name,
                    lastName: staff.last_name,
                    phoneNumber: staff.phone_number,
                    email: staff.email,
                    companyId: staff.company_id,
                    nationality: staff.nationality,
                    position: staff.position
                },
                process.env.JWT_SECRET,
                { expiresIn: ACCESS_TOKEN_EXPIRY }
            );

            res.status(200).json({ accessToken: newAccessToken });
        });

    } catch (error) {
        console.error("❌ Error refreshing token:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

/** ✅ Logout Staff */
const logoutStaff = async (req, res) => {
    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    res.status(200).json({ message: "Logged out successfully" });
};

module.exports = { sendStaffLoginOtp, verifyStaffLoginOtp, refreshStaffToken, logoutStaff };
