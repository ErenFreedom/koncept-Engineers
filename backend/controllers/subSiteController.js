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



const getMainSiteInfo = async (req, res) => {
    try {
        const authHeader = req.headers.authorization || "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
        if (!token) return res.status(401).json({ message: "No token provided" });

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(403).json({ message: "Invalid token" });
        }

        const companyId = decoded.companyId;
        if (!companyId) return res.status(400).json({ message: "Company ID not found in token" });

        const [rows] = await db.execute(
            `SELECT id, name, email, alt_email, address1, address2, pincode, pan_s3, gst_s3, created_at 
       FROM Company WHERE id = ? AND parent_company_id IS NULL`,
            [companyId]
        );

        if (!rows.length) return res.status(404).json({ message: "Main site not found" });

        res.status(200).json({ mainSite: rows[0] });
    } catch (err) {
        console.error("❌ Error getting main site info:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};


const editMainSiteInfo = async (req, res) => {
    try {
        const authHeader = req.headers.authorization || "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
        if (!token) return res.status(401).json({ message: "No token provided" });

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(403).json({ message: "Invalid token" });
        }

        const companyId = decoded.companyId;
        if (!companyId) return res.status(400).json({ message: "Company ID not found in token" });

        const { name, email, alt_email, address1, address2, pincode } = req.body;
        if (!name || !email || !address1 || !pincode) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        const [result] = await db.execute(
            `UPDATE Company SET name=?, email=?, alt_email=?, address1=?, address2=?, pincode=?
       WHERE id=? AND parent_company_id IS NULL`,
            [name, email, alt_email || null, address1, address2 || null, pincode, companyId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Main site not found or no changes" });
        }

        res.status(200).json({ message: "Main site updated successfully" });
    } catch (err) {
        console.error("❌ Error editing main site info:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};


const editSubSiteInfo = async (req, res) => {
    try {
        const authHeader = req.headers.authorization || "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
        if (!token) return res.status(401).json({ message: "No token provided" });

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(403).json({ message: "Invalid token" });
        }

        const companyId = decoded.companyId;
        const { subsiteId, name, email, alt_email, address1, address2, pincode } = req.body;
        if (!companyId || !subsiteId || !name || !email || !address1 || !pincode) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        const [result] = await db.execute(
            `UPDATE Company SET name=?, email=?, alt_email=?, address1=?, address2=?, pincode=?
       WHERE id=? AND parent_company_id=?`,
            [name, email, alt_email || null, address1, address2 || null, pincode, subsiteId, companyId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Sub-site not found or no changes" });
        }

        res.status(200).json({ message: "Sub-site updated successfully" });
    } catch (err) {
        console.error("❌ Error editing sub-site info:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};


const deleteSubSite = async (req, res) => {
    try {
        const authHeader = req.headers.authorization || "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
        if (!token) return res.status(401).json({ message: "No token provided" });

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(403).json({ message: "Invalid token" });
        }

        const companyId = decoded.companyId;
        const { subsiteId } = req.body;
        if (!companyId || !subsiteId) return res.status(400).json({ message: "Missing sub-site ID" });

        // Drop sub-site tables (matches your RegisterSubSite procedure tables)
        const tables = [
            "Floor", "Room", "FloorArea", "RoomSegment",
            "PieceOfEquipment", "SensorBank", "Sensor",
            "SensorData", "ApiToken", "SensorAPI"
        ].map(base => `${base}_${companyId}_${subsiteId}`);

        for (const table of tables) {
            await db.execute(`DROP TABLE IF EXISTS \`${table}\``);
        }

        // Delete the sub-site entry
        const [result] = await db.execute(
            `DELETE FROM Company WHERE id=? AND parent_company_id=?`,
            [subsiteId, companyId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Sub-site not found or not owned by your company" });
        }

        res.status(200).json({ message: "Sub-site deleted with its tables" });
    } catch (err) {
        console.error("❌ Error deleting sub-site:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};


module.exports = {
    sendSubSiteOtp,
    registerSubSite,
    listSubSites,
    getMainSiteInfo,
    editMainSiteInfo,
    editSubSiteInfo,
    deleteSubSite,
};
