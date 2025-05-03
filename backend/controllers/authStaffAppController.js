const db = require("../db/connector");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendOtpSms } = require("../utils/sendOtpSms");
const { sendOtpToEmail } = require("../utils/sendOtpEmail");

require("dotenv").config();


const TOKEN_CONFIG_APP = JSON.parse(process.env.TOKEN_CONFIG_APP || "{}");
const ACCESS_TOKEN_EXPIRY = TOKEN_CONFIG_APP.accessTokenExpiry || "6h";
const REFRESH_TOKEN_EXPIRY = "10y"; 

const COOKIE_OPTIONS = {
    httpOnly: true,  
    secure: TOKEN_CONFIG_APP.cookieSecure !== undefined ? TOKEN_CONFIG_APP.cookieSecure : true,
    sameSite: "strict",
};


const sendStaffAppLoginOtp = async (req, res) => {
    try {
        const { staffIdentifier, adminIdentifier } = req.body; 

        if (!staffIdentifier || !adminIdentifier) {
            return res.status(400).json({ message: "Staff and Admin identifiers are required" });
        }

       
        const [[admin]] = await db.execute(
            `SELECT id, email, phone_number FROM Admin WHERE email = ? OR phone_number = ?`,
            [adminIdentifier, adminIdentifier]
        );

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

       
        let otpSent = { success: false };
        if (adminIdentifier.includes("@")) {
            otpSent = await sendOtpToEmail(adminIdentifier, `Staff member (${staffIdentifier}) is requesting to log in. OTP: ${otp}`);
        } else {
            otpSent = await sendOtpSms(adminIdentifier, `Staff member (${staffIdentifier}) is requesting to log in. OTP: ${otp}`);
        }

        if (!otpSent.success) {
            return res.status(500).json({ message: "Failed to send OTP", error: otpSent.error });
        }

        
        await db.execute(
            `INSERT INTO AppLoginOtp (identifier, otp, created_at, expires_at)
             VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 10 MINUTE))
             ON DUPLICATE KEY UPDATE otp = ?, created_at = NOW(), expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE);`,
            [adminIdentifier, otp, otp]
        );

        res.status(200).json({ message: "OTP sent to Admin successfully" });

    } catch (error) {
        console.error("❌ Error sending OTP:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


const verifyStaffAppLoginOtp = async (req, res) => {
    try {
        const { staffIdentifier, adminIdentifier, otp, rememberMe } = req.body;

        if (!staffIdentifier || !adminIdentifier || !otp) {
            return res.status(400).json({ message: "Staff and Admin identifiers with OTP are required" });
        }

       
        const [otpResults] = await db.execute(
            `SELECT * FROM AppLoginOtp WHERE identifier = ? AND otp = ? AND expires_at > UTC_TIMESTAMP();`,
            [adminIdentifier, otp]
        );

        if (otpResults.length === 0) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        
        const [[staff]] = await db.execute(
            `SELECT s.id, s.first_name, s.phone_number, s.email, s.company_id, 
                    s.admin_id, s.admin_email, s.position, s.years_in_company
             FROM Staff s
             JOIN Admin a ON s.company_id = a.company_id
             WHERE (s.email = ? OR s.phone_number = ?) 
             AND (a.email = ? OR a.phone_number = ?)`,
            [staffIdentifier, staffIdentifier, adminIdentifier, adminIdentifier]
        );

        if (!staff) {
            return res.status(404).json({ message: "Staff not found or not linked to Admin" });
        }

        
        const accessToken = jwt.sign(
            { 
                staffId: staff.id,
                firstName: staff.first_name,
                phoneNumber: staff.phone_number,
                email: staff.email,
                companyId: staff.company_id,
                adminId: staff.admin_id,
                adminEmail: staff.admin_email,
                position: staff.position,
                yearsInCompany: staff.years_in_company
            },
            process.env.JWT_SECRET_APP,
            { expiresIn: ACCESS_TOKEN_EXPIRY }
        );

        const refreshToken = jwt.sign(
            { staffId: staff.id },
            process.env.JWT_SECRET_APP,
            { expiresIn: REFRESH_TOKEN_EXPIRY }
        );

        
        res.cookie("refreshToken", refreshToken, {
            ...COOKIE_OPTIONS,
            maxAge: rememberMe ? 10 * 365 * 24 * 60 * 60 * 1000 : null, 
        });

        
        await db.execute(`DELETE FROM AppLoginOtp WHERE identifier = ?`, [adminIdentifier]);

        res.status(200).json({ 
            message: "Login successful", 
            accessToken,
            staff: {
                id: staff.id,
                firstName: staff.first_name,
                phoneNumber: staff.phone_number,
                email: staff.email,
                companyId: staff.company_id,
                adminId: staff.admin_id,
                adminEmail: staff.admin_email,
                position: staff.position,
                yearsInCompany: staff.years_in_company
            }
        });

    } catch (error) {
        console.error("❌ Error verifying OTP:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


const refreshStaffAppToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) return res.status(401).json({ message: "Unauthorized" });

       
        jwt.verify(refreshToken, process.env.JWT_SECRET_APP, async (err, decoded) => {
            if (err) return res.status(403).json({ message: "Forbidden" });

            const [[staff]] = await db.execute(
                `SELECT id, first_name, phone_number, email, company_id, 
                        admin_id, admin_email, position, years_in_company 
                 FROM Staff WHERE id = ?`,
                [decoded.staffId]
            );

            if (!staff) return res.status(404).json({ message: "Staff not found" });

            const newAccessToken = jwt.sign(
                { 
                    staffId: staff.id,
                    firstName: staff.first_name,
                    phoneNumber: staff.phone_number,
                    email: staff.email,
                    companyId: staff.company_id,
                    adminId: staff.admin_id,
                    adminEmail: staff.admin_email,
                    position: staff.position,
                    yearsInCompany: staff.years_in_company
                },
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


const logoutStaffApp = async (req, res) => {
    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    res.status(200).json({ message: "Logged out successfully" });
};

module.exports = { sendStaffAppLoginOtp, verifyStaffAppLoginOtp, refreshStaffAppToken, logoutStaffApp };
