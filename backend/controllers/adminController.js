const db = require("../db/connector");
const bcrypt = require("bcrypt");
const { uploadFile } = require("../utils/s3Uploader");
const sendOtpSms = require("../utils/sendOtpSms"); // Twilio for SMS OTP
const { sendOtpToEmail } = require("../utils/sendOtpEmail");

// **✅ Send OTP for Admin Registration**
const sendRegistrationOtp = async (req, res) => {
    try {
        const { identifier } = req.body; // Can be email or phone number

        if (!identifier) {
            return res.status(400).json({ message: "Identifier (email or phone) is required" });
        }

        // ✅ Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        let otpSent = { success: false };
        if (identifier.includes("@")) {
            otpSent = await sendOtpToEmail(identifier, otp);
        } else {
            otpSent = await sendOtpSms(identifier, otp);
        }

        if (!otpSent.success) {
            return res.status(500).json({ message: "Failed to send OTP", error: otpSent.error });
        }

        // ✅ Store OTP in MySQL
        const otpQuery = `
            INSERT INTO RegisterOtp (identifier, otp, created_at, expires_at)
            VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 2 MINUTE))
            ON DUPLICATE KEY UPDATE otp = ?, created_at = NOW(), expires_at = DATE_ADD(NOW(), INTERVAL 2 MINUTE);
        `;

        await db.execute(otpQuery, [identifier, otp, otp]);

        console.log(`✅ OTP stored successfully for ${identifier}`);
        res.status(200).json({ message: "OTP sent successfully" });

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
            email, alt_email, company_name, company_email, company_alt_email,
            company_address1, company_address2, company_pincode, otp
        } = req.body;

        if (!phone_number || !email || !otp) {
            return res.status(400).json({ message: "Email, phone number, and OTP are required" });
        }

        // ✅ Verify OTP using either phone number or email
        const identifier = email || phone_number;
        console.log("🔍 Checking OTP for:", identifier, "with OTP:", otp);

        const otpQuery = `
            SELECT * FROM RegisterOtp 
            WHERE identifier = ? 
            AND otp = ? 
            AND expires_at > UTC_TIMESTAMP();
        `;
        const [otpResults] = await db.execute(otpQuery, [identifier, otp]);

        if (otpResults.length === 0) {
            console.error("❌ Invalid or expired OTP for", identifier);
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // ✅ OTP is valid, proceed with registration
        connection = await db.getConnection();
        await connection.beginTransaction();

        // ✅ Upload required documents to S3
        const uploadedFiles = {};
        const fileFields = ["aadhar", "pan", "gst"];
        for (const field of fileFields) {
            if (!req.files[field] || req.files[field].length === 0) {
                console.error(`❌ Missing required document: ${field}`);
                return res.status(400).json({ message: `${field} file is required` });
            }
            const file = req.files[field][0];
            const { key } = await uploadFile(file, phone_number);
            uploadedFiles[field] = key;
        }

        // ✅ Hash password securely
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ **Call Stored Procedure**
        const procedureCall = `CALL RegisterAdminAndCompany(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const procedureParams = [
            first_name, middle_name, last_name, date_of_birth, nationality,
            address1, address2, pincode, phone_number, email, landline, hashedPassword,
            uploadedFiles.aadhar, company_name, company_email, company_alt_email,
            company_address1, company_address2, company_pincode,
            uploadedFiles.pan, uploadedFiles.gst
        ];
        const [procedureResult] = await connection.execute(procedureCall, procedureParams);

        // ✅ Extract Company ID
        const companyId = procedureResult[0][0].companyId;

        // ✅ Check if all required tables were created
        const tables = [`SensorBank_${companyId}`, `Sensor_${companyId}`, `SensorData_${companyId}`, `ApiToken_${companyId}`];
        for (let table of tables) {
            const checkTableQuery = `SHOW TABLES LIKE '${table}'`;
            const [tableExists] = await connection.execute(checkTableQuery);
            if (tableExists.length === 0) {
                console.error(`❌ Table ${table} was not created.`);
                await connection.rollback();
                return res.status(500).json({ message: `Failed to create table ${table}` });
            }
        }

        // ✅ Delete OTP after successful registration
        await db.execute(`DELETE FROM RegisterOtp WHERE identifier = ?`, [identifier]);

        await connection.commit();
        console.log(`✅ Admin & Company registered successfully. Company ID: ${companyId}`);

        res.status(201).json({ message: "Admin and Company registered successfully", company_id: companyId });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("❌ Error registering admin:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    } finally {
        if (connection) await connection.release();
    }
};

module.exports = { sendRegistrationOtp, registerAdmin };
