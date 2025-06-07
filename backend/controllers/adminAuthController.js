const db = require("../db/connector");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendOtpSms } = require("../utils/sendOtpSms");
const { sendOtpToEmail } = require("../utils/sendOtpEmail");
const redisClient = require("../redisClient");
const { v4: uuidv4 } = require("uuid");


require("dotenv").config();


const TOKEN_CONFIG = JSON.parse(process.env.TOKEN_CONFIG || "{}");
const ACCESS_TOKEN_EXPIRY = TOKEN_CONFIG.accessTokenExpiry || "6h";
const REFRESH_TOKEN_EXPIRY = TOKEN_CONFIG.refreshTokenExpiry || "30d";

const COOKIE_OPTIONS = {
    httpOnly: true,  
    secure: false,
    sameSite: "lax", 
    path:"/",
};


const sendAdminLoginOtp = async (req, res) => {
    try {
        console.log("📩 Incoming Request Headers:", req.headers);
        console.log("📩 Incoming Request Body (Parsed):", req.body);

        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ message: "Identifier (email or phone) and password are required" });
        }

        console.log("🔍 Checking Admin in Database for:", identifier);
        const [adminResults] = await db.execute(
            `SELECT id, password_hash FROM Admin WHERE email = ? OR phone_number = ?`,
            [identifier, identifier]
        );

        console.log("🗂 Admin Query Result:", adminResults);

        if (adminResults.length === 0) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const admin = adminResults[0];

        console.log("🔑 Stored Password in DB:", admin.password_hash);
        console.log("🔑 Password Provided:", password);

        const passwordMatch = await bcrypt.compare(password, admin.password_hash);
        console.log("🔐 Password Match Result:", passwordMatch);

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




//Bruh this part is tiring asf, so many fields required, almost took me 1 day for debugging

const verifyAdminLoginOtp = async (req, res) => {
  try {
    const { identifier, otp, rememberMe } = req.body;

    if (!identifier || !otp) {
      return res.status(400).json({ message: "Identifier and OTP are required" });
    }

    const [otpResults] = await db.execute(
      `SELECT * FROM LoginOtp WHERE identifier = ? AND otp = ? AND expires_at > UTC_TIMESTAMP();`,
      [identifier, otp]
    );

    if (otpResults.length === 0) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const [[admin]] = await db.execute(
      `SELECT 
         a.id AS admin_id,
         a.first_name, a.last_name, a.phone_number, a.email, a.nationality,
         a.company_id AS company_id,
         c.name AS company_name,
         c.email AS company_email
       FROM Admin a
       JOIN Company c ON a.company_id = c.id
       WHERE a.email = ? OR a.phone_number = ?`,
      [identifier, identifier]
    );

    if (!admin) {
      return res.status(404).json({ message: "Admin not found or not linked to company" });
    }

    const [subSites] = await db.execute(
      `SELECT id AS subSiteId, name AS subSiteName, email AS subSiteEmail
       FROM Company WHERE parent_company_id = ?`,
      [admin.company_id]
    );

    const accessToken = jwt.sign(
      {
        adminId: admin.admin_id,
        firstName: admin.first_name,
        lastName: admin.last_name,
        phoneNumber: admin.phone_number,
        email: admin.email,
        companyId: admin.company_id,
        companyName: admin.company_name,
        companyEmail: admin.company_email,
        nationality: admin.nationality,
        subSites
      },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { adminId: admin.admin_id },
      process.env.JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    const sessionId = uuidv4();
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;

    await redisClient.set(
      `admin:${admin.admin_id}:${sessionId}`,
      JSON.stringify({
        refreshToken,
        loginTime: Date.now(),
        expiresAt,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
      }),
      { EX: 30 * 24 * 60 * 60 }
    );

    await db.execute(`DELETE FROM LoginOtp WHERE identifier = ?`, [identifier]);

    res.cookie("refreshToken", refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 6 * 60 * 60 * 1000
    });

    res.status(200).json({
      message: "Login successful",
      accessToken,
      sessionId,
      admin: {
        id: admin.admin_id,
        firstName: admin.first_name,
        lastName: admin.last_name,
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







const refreshAdminToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden (invalid token)" });
      }

      const adminId = decoded.adminId;
      const sessionKeys = await redisClient.keys(`admin:${adminId}:*`);

      let validSession = null;

      for (const key of sessionKeys) {
        const session = await redisClient.get(key);
        if (!session) continue;

        const parsed = JSON.parse(session);
        if (parsed.refreshToken === refreshToken) {
          validSession = parsed;
          break;
        }
      }

      if (!validSession) {
        return res.status(401).json({ message: "Session expired or invalidated" });
      }

      const [[admin]] = await db.execute(
        `SELECT 
           a.id AS admin_id,
           a.first_name, a.last_name, a.phone_number, a.email, a.nationality,
           a.company_id AS company_id,
           c.name AS company_name,
           c.email AS company_email
         FROM Admin a
         JOIN Company c ON a.company_id = c.id
         WHERE a.id = ?`,
        [adminId]
      );

      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      const [subSites] = await db.execute(
        `SELECT id AS subSiteId, name AS subSiteName, email AS subSiteEmail
         FROM Company WHERE parent_company_id = ?`,
        [admin.company_id]
      );

      const newAccessToken = jwt.sign(
        {
          adminId: admin.admin_id,
          firstName: admin.first_name,
          lastName: admin.last_name,
          phoneNumber: admin.phone_number,
          email: admin.email,
          companyId: admin.company_id,
          companyName: admin.company_name,
          companyEmail: admin.company_email,
          nationality: admin.nationality,
          subSites
        },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
      );

      res.status(200).json({
        accessToken: newAccessToken,
        admin: {
          id: admin.admin_id,
          firstName: admin.first_name,
          lastName: admin.last_name,
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
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


  
const resendAdminLoginOtp = async (req, res) => {
    try {
      const { identifier } = req.body;
  
      if (!identifier) {
        return res.status(400).json({ message: "Identifier (email or phone) is required" });
      }
  
      
      const [adminResults] = await db.execute(
        `SELECT id FROM Admin WHERE email = ? OR phone_number = ?`,
        [identifier, identifier]
      );
  
      if (adminResults.length === 0) {
        return res.status(404).json({ message: "Admin not found" });
      }
  
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log("🔁 Generated Resend OTP:", otp);
  
      let otpSent = { success: false };
      if (identifier.includes("@")) {
        console.log("📧 Resending OTP via Email:", identifier);
        otpSent = await sendOtpToEmail(identifier, otp);
      } else {
        console.log("📱 Resending OTP via SMS:", identifier);
        otpSent = await sendOtpSms(identifier, otp);
      }
  
      if (!otpSent.success) {
        return res.status(500).json({ message: "Failed to resend OTP", error: otpSent.error });
      }
  
      await db.execute(
        `INSERT INTO LoginOtp (identifier, otp, created_at, expires_at)
         VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 10 MINUTE))
         ON DUPLICATE KEY UPDATE otp = ?, created_at = NOW(), expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE);`,
        [identifier, otp, otp]
      );
  
      console.log("✅ Resend OTP Successfully Stored for:", identifier);
      res.status(200).json({ message: "OTP resent successfully" });
  
    } catch (error) {
      console.error("❌ Error in resendAdminLoginOtp:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  };
  


  const logoutAdmin = async (req, res) => {
    try {
      const { adminId, sessionId } = req.body;
  
      if (!adminId || !sessionId) {
        return res.status(400).json({ message: "adminId and sessionId are required" });
      }
  
      const redisKey = `admin:${adminId}:${sessionId}`;
      await redisClient.del(redisKey);
  
      res.clearCookie("refreshToken", COOKIE_OPTIONS);
      res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
      console.error("❌ Logout failed:", err);
      res.status(500).json({ message: "Logout failed", error: err.message });
    }
  };
  

module.exports = { sendAdminLoginOtp, verifyAdminLoginOtp, refreshAdminToken,resendAdminLoginOtp, logoutAdmin };
