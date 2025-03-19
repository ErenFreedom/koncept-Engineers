const db = require("../db/connector");
const bcrypt = require("bcrypt");
const { sendOtpToEmail } = require("../utils/sendOtpEmail");
const sendOtpSms = require("../utils/sendOtpSms");

// **✅ Send OTP for Admin Registration**
const sendRegistrationOtp = async (req, res) => {
    try {
        const { email, phone_number, otp_method } = req.body;

        if (!email || !phone_number) {
            return res.status(400).json({ message: "Email and phone number are required" });
        }
        if (!otp_method) {
            return res.status(400).json({ message: "OTP method (email/phone) is required" });
        }

        // ✅ Check if Admin Already Exists
        const [[adminRow]] = await db.execute(
            `SELECT id FROM Admin WHERE email = ? OR phone_number = ?`, 
            [email, phone_number]
        );
        if (adminRow) {
            return res.status(400).json({ message: "Admin already exists. Try logging in." });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // ✅ Send OTP to Email or Phone
        let otpSent = { success: false };
        if (otp_method === "email") {
            otpSent = await sendOtpToEmail(email, `Your OTP for registration: ${otp}`);
        } else {
            otpSent = await sendOtpSms(phone_number, otp);
        }

        if (!otpSent.success) {
            return res.status(500).json({ message: "Failed to send OTP", error: otpSent.error });
        }

        // ✅ Store OTP in MySQL
        const otpQuery = `
            INSERT INTO RegisterOtp (email, phone_number, otp, created_at, expires_at)
            VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 10 MINUTE))
            ON DUPLICATE KEY UPDATE otp = ?, created_at = NOW(), expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE);
        `;
        await db.execute(otpQuery, [email, phone_number, otp, otp]);

        console.log(`✅ OTP sent successfully to ${otp_method === "email" ? email : phone_number}`);
        res.status(200).json({ message: `OTP sent to your registered ${otp_method}` });

    } catch (error) {
        console.error("❌ Error sending OTP:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// **✅ Verify OTP & Register Admin**
const registerAdmin = async (req, res) => {
    let connection;
    try {
        const {
            first_name, middle_name, last_name, date_of_birth, nationality,
            address1, address2, pincode, phone_number, landline, password,
            email, company_name, company_email, company_address1, company_address2, company_pincode, otp
        } = req.body;

        console.log("🔍 Incoming Data:", req.body); // ✅ Log incoming data for debugging

        if (!email || !phone_number || !otp) {
            return res.status(400).json({ message: "Email, phone number, and OTP are required" });
        }

        // ✅ Verify OTP
        const otpQuery = `
            SELECT * FROM RegisterOtp 
            WHERE (email = ? OR phone_number = ?) 
            AND otp = ? 
            AND expires_at > UTC_TIMESTAMP();
        `;
        const [otpResults] = await db.execute(otpQuery, [email, phone_number, otp]);

        if (otpResults.length === 0) {
            console.error("❌ Invalid or expired OTP for", email, phone_number);
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // ✅ OTP is valid, proceed with registration
        connection = await db.getConnection();
        await connection.beginTransaction();

        // ✅ Hash password securely
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Convert undefined values to NULL for MySQL
        const sanitizedData = [
            first_name || null, middle_name || null, last_name || null, date_of_birth || null, nationality || null,
            address1 || null, address2 || null, pincode || null, phone_number || null, landline || null, 
            email || null, hashedPassword
        ];

        // ✅ Insert Admin into Database
        const insertAdminQuery = `
            INSERT INTO Admin (first_name, middle_name, last_name, date_of_birth, nationality, 
                              address1, address2, pincode, phone_number, landline, email, password_hash)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        await connection.execute(insertAdminQuery, sanitizedData);

        // ✅ Insert Company Details
        const insertCompanyQuery = `
            INSERT INTO Company (name, email, address1, address2, pincode)
            VALUES (?, ?, ?, ?, ?);
        `;
        await connection.execute(insertCompanyQuery, [
            company_name || null, company_email || null, company_address1 || null, 
            company_address2 || null, company_pincode || null
        ]);

        // ✅ Delete OTP after successful registration
        await db.execute(`DELETE FROM RegisterOtp WHERE email = ? OR phone_number = ?`, [email, phone_number]);

        await connection.commit();
        console.log(`✅ Admin & Company registered successfully.`);

        res.status(201).json({ message: "Admin and Company registered successfully" });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("❌ Error registering admin:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    } finally {
        if (connection) await connection.release();
    }
};

module.exports = { sendRegistrationOtp, registerAdmin };
