const db = require("../db/connector");
const { sendOtpToEmail } = require("../utils/sendOtpEmail");
const sendOtpSms = require("../utils/sendOtpSms");
const jwt = require("jsonwebtoken");

const sendSubSiteOtp = async (req, res) => {
    try {
        const { adminEmail, adminPhone, otp_method } = req.body;

        if (!otp_method || (otp_method !== "email" && otp_method !== "phone")) {
            return res.status(400).json({ message: "Valid OTP method (email/phone) is required" });
        }

        if (otp_method === "email" && !adminEmail) {
            return res.status(400).json({ message: "Admin email is required for email OTP" });
        }

        if (otp_method === "phone" && !adminPhone) {
            return res.status(400).json({ message: "Admin phone is required for phone OTP" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        let otpSent = { success: false };
        if (otp_method === "email") {
            otpSent = await sendOtpToEmail(adminEmail, `Your OTP for sub-site registration: ${otp}`);
        } else {
            otpSent = await sendOtpSms(adminPhone, otp);
        }

        if (!otpSent.success) {
            return res.status(500).json({ message: "Failed to send OTP", error: otpSent.error });
        }

        await db.execute(
            `INSERT INTO RegisterOtp (email, phone_number, otp, created_at, expires_at)
             VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 10 MINUTE))
             ON DUPLICATE KEY UPDATE otp = ?, created_at = NOW(), expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE);`,
            [adminEmail || null, adminPhone || null, otp, otp]
        );

        res.status(200).json({ message: `OTP sent to admin via ${otp_method}` });

    } catch (err) {
        console.error("❌ Error sending sub-site OTP:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};


const registerSubSite = async (req, res) => {
    try {
        const {
            parentCompanyId,
            adminEmail, adminPhone,
            siteName, siteEmail, siteAltEmail,
            siteAddress1, siteAddress2, sitePincode,
            sitePanS3, siteGstS3,
            phone_number, otp
        } = req.body;

        if (!parentCompanyId || !siteName || !otp || (!adminEmail && !adminPhone)) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        
        const [otpResult] = await db.execute(
            `SELECT * FROM RegisterOtp
             WHERE (email = ? OR phone_number = ?)
             AND otp = ? AND expires_at > UTC_TIMESTAMP()`,
            [adminEmail || null, adminPhone || null, otp]
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

        // Cleanup OTP
        await db.execute(
            `DELETE FROM RegisterOtp WHERE email = ? OR phone_number = ?`,
            [adminEmail || null, adminPhone || null]
        );

        res.status(201).json({ message: "Sub-site registered successfully" });

    } catch (err) {
        console.error("❌ Error registering sub-site:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

const listSubSites = async (req, res) => {
    try {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }
  
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return res.status(403).json({ message: "Invalid token" });
      }
  
      const companyId = decoded.companyId;
  
      if (!companyId) {
        return res.status(400).json({ message: "Company ID not found in token" });
      }
  
      const [subsites] = await db.execute(
        `SELECT 
           id AS subSiteId,
           name AS subSiteName,
           email AS subSiteEmail,
           alt_email AS subSiteAltEmail,
           address1, address2, pincode,
           pan_s3, gst_s3, created_at
         FROM Company
         WHERE parent_company_id = ?`,
        [companyId]
      );
  
      res.status(200).json({ subsites });
    } catch (error) {
      console.error("❌ Error fetching sub-sites:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  

module.exports = { sendSubSiteOtp, registerSubSite, listSubSites };
