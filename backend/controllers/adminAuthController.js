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

/** ✅ Send OTP for Admin Login */
const sendAdminLoginOtp = async (req, res) => {
    try {
        console.log("📩 Received Send OTP Request:", req.body); // 🛠 Debugging log

        const { identifier, password } = req.body;

        if (!identifier || !password) {
            console.error("⚠️ Missing Identifier or Password in Request");
            return res.status(400).json({ message: "Identifier (email or phone) and password are required" });
        }

        // ✅ Check if admin exists
        console.log("🔍 Checking Admin in Database for:", identifier);
        const [adminResults] = await db.execute(
            `SELECT id, password FROM Admin WHERE email = ? OR phone_number = ?`,
            [identifier, identifier]
        );

        console.log("🗂 Admin Query Result:", adminResults);

        if (adminResults.length === 0) {
            console.error("❌ Admin Not Found:", identifier);
            return res.status(404).json({ message: "Admin not found" });
        }

        const admin = adminResults[0];

        // ✅ Compare password
        console.log("🔑 Verifying Password for Admin ID:", admin.id);
        const passwordMatch = await bcrypt.compare(password, admin.password);
        if (!passwordMatch) {
            console.error("❌ Incorrect Password for:", identifier);
            return res.status(401).json({ message: "Incorrect password" });
        }

        // ✅ Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log("🛠 Generated OTP:", otp);

        // ✅ Send OTP via Email or SMS
        let otpSent = { success: false };
        if (identifier.includes("@")) {
            console.log("📧 Sending OTP via Email:", identifier);
            otpSent = await sendOtpToEmail(identifier, otp);
        } else {
            console.log("📱 Sending OTP via SMS:", identifier);
            otpSent = await sendOtpSms(identifier, otp);
        }

        if (!otpSent.success) {
            console.error("❌ OTP Sending Failed:", otpSent.error);
            return res.status(500).json({ message: "Failed to send OTP", error: otpSent.error });
        }

        // ✅ Store OTP in the `LoginOtp` table
        console.log("📝 Storing OTP in Database");
        await db.execute(
            `INSERT INTO LoginOtp (identifier, otp, created_at, expires_at)
             VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 10 MINUTE))
             ON DUPLICATE KEY UPDATE otp = ?, created_at = NOW(), expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE);`,
            [identifier, otp, otp]
        );

        console.log("✅ OTP Successfully Sent and Stored for:", identifier);
        res.status(200).json({ message: "OTP sent successfully" });

    } catch (error) {
        console.error("❌ Error in sendAdminLoginOtp:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};



/** ✅ Verify OTP & Authenticate Admin */
const verifyAdminLoginOtp = async (req, res) => {
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

        // ✅ Fetch Admin Details
        const [[admin]] = await db.execute(
            `SELECT id, first_name, last_name, phone_number, email, company_id, nationality 
             FROM Admin WHERE email = ? OR phone_number = ?`,
            [identifier, identifier]
        );

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // ✅ Generate JWT Access & Refresh Tokens
        const accessToken = jwt.sign(
            { 
                adminId: admin.id,
                firstName: admin.first_name,
                lastName: admin.last_name,
                phoneNumber: admin.phone_number,
                email: admin.email,
                companyId: admin.company_id,
                nationality: admin.nationality
            },
            process.env.JWT_SECRET,
            { expiresIn: ACCESS_TOKEN_EXPIRY }
        );

        const refreshToken = jwt.sign(
            { adminId: admin.id },
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
            admin: {
                id: admin.id,
                firstName: admin.first_name,
                lastName: admin.last_name,
                phoneNumber: admin.phone_number,
                email: admin.email,
                companyId: admin.company_id,
                nationality: admin.nationality
            }
        });

    } catch (error) {
        console.error("❌ Error verifying OTP:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

/** ✅ Refresh Access Token */
const refreshAdminToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) return res.status(401).json({ message: "Unauthorized" });

        // ✅ Verify Refresh Token
        jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) return res.status(403).json({ message: "Forbidden" });

            const [[admin]] = await db.execute(
                `SELECT id, first_name, last_name, phone_number, email, company_id, nationality 
                 FROM Admin WHERE id = ?`,
                [decoded.adminId]
            );

            if (!admin) return res.status(404).json({ message: "Admin not found" });

            const newAccessToken = jwt.sign(
                { 
                    adminId: admin.id,
                    firstName: admin.first_name,
                    lastName: admin.last_name,
                    phoneNumber: admin.phone_number,
                    email: admin.email,
                    companyId: admin.company_id,
                    nationality: admin.nationality
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

/** ✅ Logout Admin */
const logoutAdmin = async (req, res) => {
    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    res.status(200).json({ message: "Logged out successfully" });
};

module.exports = { sendAdminLoginOtp, verifyAdminLoginOtp, refreshAdminToken, logoutAdmin };
