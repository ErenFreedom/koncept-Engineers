const db = require("../db/connector");
const bcrypt = require("bcrypt");
const { uploadFile } = require("../utils/s3Uploader");
const { sendOtpToPhone } = require("../utils/sendOtpAWS");
const { sendOtpToEmail } = require("../utils/sendOtpEmail");

// **Send OTP for Admin Registration**
const sendRegistrationOtp = async (req, res) => {
    try {
        const { identifier } = req.body; // Can be phone number or email
        if (!identifier) {
            return res.status(400).json({ message: "Identifier (email or phone) is required" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate OTP

        // Send OTP via Email or Phone
        let otpSent = false;
        if (identifier.includes("@")) {
            otpSent = await sendOtpToEmail(identifier, otp);
        } else {
            otpSent = await sendOtpToPhone(identifier, otp);
        }

        if (!otpSent) {
            return res.status(500).json({ message: "Failed to send OTP" });
        }

        // Store OTP in the `RegisterOtp` table
        const otpQuery = `
            INSERT INTO RegisterOtp (identifier, otp, expires_at)
            VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 2 MINUTE))
            ON DUPLICATE KEY UPDATE otp = ?, expires_at = DATE_ADD(NOW(), INTERVAL 2 MINUTE);
        `;
        await db.execute(otpQuery, [identifier, otp, otp]);

        res.status(200).json({ message: "OTP sent successfully" });

    } catch (error) {
        console.error("❌ Error sending OTP:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// **Verify OTP & Register Admin**
const registerAdmin = async (req, res) => {
    let connection;
    try {
        const {
            first_name, middle_name, last_name, date_of_birth, nationality,
            address1, address2, pincode, phone_number, landline, password,
            email, alt_email, company_name, company_email, company_alt_email,
            company_address1, company_address2, company_pincode, otp
        } = req.body;

        if (!email || !company_email || !otp) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // **Validate OTP**
        const otpQuery = `SELECT * FROM RegisterOtp WHERE identifier = ? AND otp = ? AND expires_at > NOW()`;
        const [otpResults] = await db.execute(otpQuery, [email, otp]);

        if (otpResults.length === 0) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // OTP is valid, proceed with registration
        connection = await db.getConnection();
        await connection.beginTransaction();

        // **Upload Documents to S3**
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

        // **Hash password**
        const hashedPassword = await bcrypt.hash(password, 10);

        // **Insert Company**
        const companyQuery = `
            INSERT INTO Company (name, email, alt_email, address1, address2, pincode, pan_s3, gst_s3)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `;
        const companyValues = [company_name, company_email, company_alt_email, company_address1, company_address2, company_pincode, uploadedFiles.pan, uploadedFiles.gst];

        const [companyResult] = await connection.execute(companyQuery, companyValues);
        const companyId = companyResult.insertId;

        // **Insert Admin**
        const adminQuery = `
            INSERT INTO Admin (first_name, middle_name, last_name, date_of_birth, nationality, address1, address2, pincode,
                               phone_number, landline, email, alt_email, password_hash, aadhar_pan_passport_s3, company_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        const adminValues = [
            first_name, middle_name, last_name, date_of_birth, nationality,
            address1, address2, pincode, phone_number, landline,
            email, alt_email, hashedPassword, uploadedFiles.aadhar, companyId
        ];
        await connection.execute(adminQuery, adminValues);

        // **Call Procedure to Initialize Company-Specific Sensor Tables**
        const procedureCall = `CALL RegisterAdminAndCompany(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const procedureParams = [
            first_name, middle_name, last_name, date_of_birth, nationality,
            address1, address2, pincode, phone_number, landline, hashedPassword,
            uploadedFiles.aadhar, company_name, company_address1, company_address2,
            company_pincode, uploadedFiles.pan, uploadedFiles.gst
        ];
        await connection.execute(procedureCall, procedureParams);

        // **Delete OTP after successful registration**
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
