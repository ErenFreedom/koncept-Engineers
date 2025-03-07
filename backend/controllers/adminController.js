const db = require("../db/connector");
const bcrypt = require("bcrypt");
const { uploadFile } = require("../utils/s3Uploader");
const sendOtpSms = require("../utils/sendOtpSms"); // Twilio for SMS OTP
const { sendOtpToEmail } = require("../utils/sendOtpEmail");

// **Send OTP for Admin Registration**
const sendRegistrationOtp = async (req, res) => {
    try {
        const { identifier } = req.body; // Can be phone number or email

        if (!identifier) {
            return res.status(400).json({ message: "Identifier (email or phone) is required" });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Send OTP via Email or Phone
        let otpSent = { success: false };
        if (identifier.includes("@")) {
            otpSent = await sendOtpToEmail(identifier, otp);
        } else {
            otpSent = await sendOtpSms(identifier, otp);
        }

        if (!otpSent.success) {
            return res.status(500).json({ message: "Failed to send OTP", error: otpSent.error });
        }

        // ✅ Convert IST Time to UTC before storing
        const currentTimeIST = new Date(); // Get current IST time
        const currentTimeUTC = new Date(currentTimeIST.getTime() - (5.5 * 60 * 60 * 1000)); // Convert IST to UTC
        const expiresAtUTC = new Date(currentTimeUTC.getTime() + (2 * 60 * 1000)); // Add 2 minutes for expiry

        // ✅ Store OTP in UTC format for both Email & Phone
        const otpQuery = `
            INSERT INTO RegisterOtp (identifier, otp, created_at, expires_at)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE otp = ?, created_at = ?, expires_at = ?;
        `;
        await db.execute(otpQuery, [identifier, otp, currentTimeUTC, expiresAtUTC, otp, currentTimeUTC, expiresAtUTC]);

        console.log(`✅ OTP stored successfully for ${identifier}`);

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

        if ((!phone_number && !email) || !otp) {
            return res.status(400).json({ message: "Phone number or email is required for OTP validation" });
        }

        // ✅ **Check OTP in RegisterOtp table for both email & phone**
        let otpValid = false;

        if (email) {
            const otpQueryEmail = `
                SELECT * FROM RegisterOtp 
                WHERE identifier = ? AND otp = ? 
                AND expires_at > UTC_TIMESTAMP();
            `;
            const [otpResultsEmail] = await db.execute(otpQueryEmail, [email, otp]);
            if (otpResultsEmail.length > 0) {
                otpValid = true;
            }
        }

        if (phone_number && !otpValid) {
            const otpQueryPhone = `
                SELECT * FROM RegisterOtp 
                WHERE identifier = ? AND otp = ? 
                AND expires_at > UTC_TIMESTAMP();
            `;
            const [otpResultsPhone] = await db.execute(otpQueryPhone, [phone_number, otp]);
            if (otpResultsPhone.length > 0) {
                otpValid = true;
            }
        }

        if (!otpValid) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // ✅ OTP is valid, proceed with registration
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

        // ✅ **Delete OTP after successful registration**
        await db.execute(`DELETE FROM RegisterOtp WHERE identifier = ? OR identifier = ?`, [email, phone_number]);

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
