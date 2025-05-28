const db = require("../db/connector");
const { sendOtpToEmail } = require("../utils/sendOtpEmail");
const sendOtpSms = require("../utils/sendOtpSms");

const sendSubSiteOtp = async (req, res) => {
    try {
        const { email, phone_number, otp_method } = req.body;

        if (!otp_method || (otp_method !== "email" && otp_method !== "phone")) {
            return res.status(400).json({ message: "Valid OTP method (email/phone) is required" });
        }

        if (otp_method === "email" && !email) {
            return res.status(400).json({ message: "Email is required for email OTP method" });
        }

        if (otp_method === "phone" && !phone_number) {
            return res.status(400).json({ message: "Phone number is required for phone OTP method" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        let otpSent = { success: false };
        if (otp_method === "email") {
            otpSent = await sendOtpToEmail(email, `Your OTP for sub-site registration: ${otp}`);
        } else {
            otpSent = await sendOtpSms(phone_number, otp);
        }

        if (!otpSent.success) {
            return res.status(500).json({ message: "Failed to send OTP", error: otpSent.error });
        }

        await db.execute(
            `INSERT INTO RegisterOtp (email, phone_number, otp, created_at, expires_at)
             VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 10 MINUTE))
             ON DUPLICATE KEY UPDATE otp = ?, created_at = NOW(), expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE);`,
            [email || null, phone_number || null, otp, otp]
        );

        res.status(200).json({ message: `OTP sent via ${otp_method}` });

    } catch (err) {
        console.error("❌ Error sending sub-site OTP:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};


const registerSubSite = async (req, res) => {
    try {
        const {
            parentCompanyId,
            siteName, siteEmail, siteAltEmail,
            siteAddress1, siteAddress2, sitePincode,
            sitePanS3, siteGstS3,
            phone_number, otp
        } = req.body;

        if (!parentCompanyId || !siteName || !otp || (!siteEmail && !phone_number)) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        const [otpResult] = await db.execute(
            `SELECT * FROM RegisterOtp
             WHERE (email = ? OR phone_number = ?)
             AND otp = ? AND expires_at > UTC_TIMESTAMP()`,
            [siteEmail || null, phone_number || null, otp]
        );

        if (otpResult.length === 0) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        await db.execute(
            `CALL RegisterSubSite(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                parentCompanyId,
                siteName,
                siteEmail,
                siteAltEmail || null,
                siteAddress1,
                siteAddress2 || null,
                sitePincode,
                sitePanS3 || null,
                siteGstS3 || null
            ]
        );

        await db.execute(
            `DELETE FROM RegisterOtp WHERE email = ? OR phone_number = ?`,
            [siteEmail || null, phone_number || null]
        );

        res.status(201).json({ message: "Sub-site registered successfully" });

    } catch (err) {
        console.error("❌ Error registering sub-site:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

module.exports = { sendSubSiteOtp, registerSubSite };
