const db = require("../db/connector");
const bcrypt = require("bcrypt");
const { uploadFile } = require("../utils/s3Uploader");
const sendOtpSms = require("../utils/sendOtpSms");
const { sendOtpToEmail } = require("../utils/sendOtpEmail");

// ✅ **Send OTP for Admin Registration**
const sendRegistrationOtp = async (req, res) => {
    try {
        const { identifier } = req.body; // Can be phone number or email

        if (!identifier) {
            return res.status(400).json({ message: "Identifier (email or phone) is required" });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // ✅ Send OTP via Email or Phone
        let otpSent = { success: false };
        if (identifier.includes("@")) {
            otpSent = await sendOtpToEmail(identifier, otp);
        } else {
            otpSent = await sendOtpSms(identifier, otp);
        }

        if (!otpSent.success) {
            return res.status(500).json({ message: "Failed to send OTP", error: otpSent.error });
        }

        // ✅ Store OTP in MySQL (UTC timestamp)
        const otpQuery = `
            INSERT INTO RegisterOtp (identifier, otp, created_at, expires_at)
            VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 10 MINUTE))
            ON DUPLICATE KEY UPDATE otp = ?, created_at = NOW(), expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE);
        `;
        await db.execute(otpQuery, [identifier, otp, otp]);

        console.log(`✅ OTP stored successfully for ${identifier}`);
        res.status(200).json({ message: "OTP sent successfully" });

    } catch (error) {
        console.error("❌ Error sending OTP:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// ✅ **Verify OTP & Register Admin**
const registerAdmin = async (req, res) => {
    let connection;
    try {
        const {
            first_name, middle_name, last_name, date_of_birth, nationality,
            address1, address2, pincode, phone_number, email, landline, password,
            alt_email, company_name, company_email, company_alt_email,
            company_address1, company_address2, company_pincode, otp
        } = req.body;

        if (!phone_number || !email || !otp) {
            return res.status(400).json({ message: "Email, phone number, and OTP are required" });
        }

        // ✅ Validate OTP for email
        const otpQuery = `
            SELECT * FROM RegisterOtp 
            WHERE identifier = ? AND otp = ? 
            AND expires_at > UTC_TIMESTAMP();
        `;
        const [otpResults] = await db.execute(otpQuery, [email, otp]);

        if (otpResults.length === 0) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // ✅ OTP is valid, proceed with registration
        connection = await db.getConnection();
        await connection.beginTransaction();

        // ✅ Upload Documents to S3
        const uploadedFiles = {};
        const fileFields = ["aadhar", "pan", "gst"];
        for (const field of fileFields) {
            if (!req.files[field] || req.files[field].length === 0) {
                return res.status(400).json({ message: `${field} file is required` });
            }
            const file = req.files[field][0];
            const { key } = await uploadFile(file, phone_number);
            uploadedFiles[field] = key;
        }

        // ✅ Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ **Call Stored Procedure to Register Admin & Company**
        const procedureCall = `CALL RegisterAdminAndCompany(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const procedureParams = [
            first_name, middle_name, last_name, date_of_birth, nationality,
            address1, address2, pincode, phone_number, email, landline, hashedPassword,
            uploadedFiles.aadhar, company_name, company_email, company_alt_email,
            company_address1, company_address2, company_pincode,
            uploadedFiles.pan, uploadedFiles.gst
        ];
        const [procedureResult] = await connection.execute(procedureCall, procedureParams);

        // ✅ Extract `companyId` from the procedure response
        const companyId = procedureResult[0][0].companyId;

        // ✅ **Ensure Company-Specific Tables Are Created**
        const tables = ["SensorBank_", "Sensor_", "SensorData_", "ApiToken_"];
        for (let table of tables) {
            const tableName = `${table}${companyId}`;
            const checkTableQuery = `SHOW TABLES LIKE ?`;
            const [tableExists] = await connection.execute(checkTableQuery, [tableName]);

            if (tableExists.length === 0) {
                console.error(`❌ Table ${tableName} was not created.`);
                await connection.rollback();
                return res.status(500).json({ message: `Failed to create table ${tableName}` });
            }
        }

        // ✅ **Delete OTP after successful registration**
        await db.execute(`DELETE FROM RegisterOtp WHERE identifier = ?`, [email]);

        await connection.commit();

        console.log(`✅ Admin and Company registered successfully. Company ID: ${companyId}`);
        res.status(201).json({
            message: "Admin and Company registered successfully",
            company_id: companyId
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("❌ Error registering admin:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    } finally {
        if (connection) await connection.release();
    }
};

module.exports = { sendRegistrationOtp, registerAdmin };
