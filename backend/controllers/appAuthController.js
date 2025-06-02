const db = require("../db/connector");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendOtpSms } = require("../utils/sendOtpSms");
const { sendOtpToEmail } = require("../utils/sendOtpEmail");

require("dotenv").config();


const TOKEN_CONFIG_APP = JSON.parse(process.env.TOKEN_CONFIG_APP || "{}");
const ACCESS_TOKEN_EXPIRY = TOKEN_CONFIG_APP.accessTokenExpiry || "6h";
const REFRESH_TOKEN_EXPIRY = TOKEN_CONFIG_APP.refreshTokenExpiry || "10y"; 

const COOKIE_OPTIONS = {
    httpOnly: true,  
    secure: TOKEN_CONFIG_APP.cookieSecure !== undefined ? TOKEN_CONFIG_APP.cookieSecure : true,
    sameSite: "strict",
};


const sendAdminAppLoginOtp = async (req, res) => {
    try {
        console.log("📩 Incoming Request Body:", req.body);

        const { identifier, password } = req.body; 

        if (!identifier || !password) {
            return res.status(400).json({ message: "Email/Phone and Password are required" });
        }

        console.log("🔍 Fetching Admin from Database:", identifier);

       
        const [adminResults] = await db.execute(
            `SELECT id, password_hash FROM Admin WHERE email = ? OR phone_number = ?`,
            [identifier, identifier]
        );

        console.log("🗂 Admin Query Result:", adminResults);

        if (adminResults.length === 0) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const admin = adminResults[0];

        console.log("🔑 Stored Password Hash:", admin.password_hash);
        console.log("🔑 Entered Password:", password);

       
        const passwordMatch = await bcrypt.compare(password, admin.password_hash);
        console.log("🔐 Password Match:", passwordMatch);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log("🛠 Generated OTP:", otp);

        
        let otpSent = { success: false };
        if (identifier.includes("@")) {
            console.log("📧 Sending OTP via Email:", identifier);
            otpSent = await sendOtpToEmail(identifier, otp);
        } else {
            console.log("📱 Sending OTP via SMS:", identifier);
            otpSent = await sendOtpSms(identifier, otp);
        }

        if (!otpSent.success) {
            return res.status(500).json({ message: "Failed to send OTP", error: otpSent.error });
        }

        console.log("📝 Storing OTP in Database");
        await db.execute(
            `INSERT INTO AppLoginOtp (identifier, otp, created_at, expires_at)
             VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 10 MINUTE))
             ON DUPLICATE KEY UPDATE otp = ?, created_at = NOW(), expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE);`,
            [identifier, otp, otp]
        );

        console.log("✅ OTP Successfully Sent and Stored for:", identifier);
        res.status(200).json({ message: "OTP sent successfully" });

    } catch (error) {
        console.error("❌ Error sending OTP:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


const verifyAdminAppLoginOtp = async (req, res) => {
    try {
        const { identifier, otp, rememberMe } = req.body;

        if (!identifier || !otp) {
            return res.status(400).json({ message: "Identifier and OTP are required" });
        }

        const [otpResults] = await db.execute(
            `SELECT * FROM AppLoginOtp WHERE identifier = ? AND otp = ? AND expires_at > UTC_TIMESTAMP();`,
            [identifier, otp]
        );

        if (otpResults.length === 0) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        const [[admin]] = await db.execute(
            `SELECT 
                a.id AS admin_id, a.first_name, a.phone_number, a.email, a.nationality,
                a.company_id AS company_id,
                c.name AS company_name, c.email AS company_email
             FROM Admin a
             JOIN Company c ON a.company_id = c.id
             WHERE a.email = ? OR a.phone_number = ?`,
            [identifier, identifier]
        );

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // 🏢 Fetch sub-sites for the app token too
        const [subSites] = await db.execute(
            `SELECT id AS subSiteId, name AS subSiteName, email AS subSiteEmail
             FROM Company WHERE parent_company_id = ?`,
            [admin.company_id]
        );

        const accessToken = jwt.sign(
            {
                adminId: admin.admin_id,
                firstName: admin.first_name,
                phoneNumber: admin.phone_number,
                email: admin.email,
                nationality: admin.nationality,
                companyId: admin.company_id,
                companyName: admin.company_name,
                companyEmail: admin.company_email,
                subSites
            },
            process.env.JWT_SECRET_APP,
            { expiresIn: ACCESS_TOKEN_EXPIRY }
        );

        const refreshToken = jwt.sign(
            { adminId: admin.admin_id },
            process.env.JWT_SECRET_APP,
            { expiresIn: REFRESH_TOKEN_EXPIRY }
        );

        await db.execute(`DELETE FROM AppLoginOtp WHERE identifier = ?`, [identifier]);

        res.cookie("refreshToken", refreshToken, {
            ...COOKIE_OPTIONS,
            maxAge: rememberMe ? 10 * 365 * 24 * 60 * 60 * 1000 : null,
        });

        res.status(200).json({
            message: "Login successful",
            accessToken,
            admin: {
                id: admin.admin_id,
                firstName: admin.first_name,
                phoneNumber: admin.phone_number,
                email: admin.email,
                nationality: admin.nationality,
                companyId: admin.company_id,
                companyName: admin.company_name,
                companyEmail: admin.company_email,
                subSites
            }
        });

    } catch (error) {
        console.error("❌ Error verifying OTP:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


const refreshAdminAppToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) return res.status(401).json({ message: "Unauthorized" });

        jwt.verify(refreshToken, process.env.JWT_SECRET_APP, async (err, decoded) => {
            if (err) return res.status(403).json({ message: "Forbidden" });

            const [[admin]] = await db.execute(
                `SELECT 
                    a.id AS admin_id, a.first_name, a.phone_number, a.email, a.nationality,
                    a.company_id AS company_id,
                    c.name AS company_name, c.email AS company_email
                 FROM Admin a
                 JOIN Company c ON a.company_id = c.id
                 WHERE a.id = ?`,
                [decoded.adminId]
            );

            if (!admin) return res.status(404).json({ message: "Admin not found" });

            const [subSites] = await db.execute(
                `SELECT id AS subSiteId, name AS subSiteName, email AS subSiteEmail
                 FROM Company WHERE parent_company_id = ?`,
                [admin.company_id]
            );

            const newAccessToken = jwt.sign(
                {
                    adminId: admin.admin_id,
                    firstName: admin.first_name,
                    phoneNumber: admin.phone_number,
                    email: admin.email,
                    nationality: admin.nationality,
                    companyId: admin.company_id,
                    companyName: admin.company_name,
                    companyEmail: admin.company_email,
                    subSites
                },
                process.env.JWT_SECRET_APP,
                { expiresIn: ACCESS_TOKEN_EXPIRY }
            );

            res.status(200).json({
                accessToken: newAccessToken,
                admin: {
                    id: admin.admin_id,
                    firstName: admin.first_name,
                    phoneNumber: admin.phone_number,
                    email: admin.email,
                    nationality: admin.nationality,
                    companyId: admin.company_id,
                    companyName: admin.company_name,
                    companyEmail: admin.company_email,
                    subSites
                }
            });
        });

    } catch (error) {
        console.error("❌ Error refreshing token:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


const logoutAdminApp = async (req, res) => {
    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    res.status(200).json({ message: "Logged out successfully" });
};

module.exports = { sendAdminAppLoginOtp, verifyAdminAppLoginOtp, refreshAdminAppToken, logoutAdminApp };
