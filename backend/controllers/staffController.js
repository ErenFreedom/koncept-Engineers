const db = require("../db/connector");
const bcrypt = require("bcrypt");
const { uploadFile } = require("../utils/s3Uploader");
const { sendOtpSms } = require("../utils/sendOtpSms"); // ✅ Updated to use Twilio SMS
const { sendOtpToEmail } = require("../utils/sendOtpEmail");

// **Send OTP for Staff Registration**
const sendRegistrationOtp = async (req, res) => {
    try {
        const { identifier } = req.body; // Can be phone number or email

        if (!identifier) {
            return res.status(400).json({ message: "Identifier (email or phone) is required" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate OTP

        // Send OTP via Email or SMS
        let otpSent = false;
        if (identifier.includes("@")) {
            otpSent = await sendOtpToEmail(identifier, otp);
        } else {
            otpSent = await sendOtpSms(identifier, otp); // ✅ Uses Twilio instead of AWS SNS
        }

        if (!otpSent.success) {
            return res.status(500).json({ message: "Failed to send OTP", error: otpSent.error });
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

// **Verify OTP & Register Staff**
const registerStaff = async (req, res) => {
    let connection;
    try {
        const {
            first_name, last_name, date_of_birth, gender, nationality,
            phone_number, alt_phone_number, email, alt_email,
            address1, address2, pincode, position, years_in_company, password,
            company_email, admin_email, otp
        } = req.body;

        if (!email || !company_email || !admin_email || !otp) {
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

        // **Retrieve Company ID and Admin ID from emails**
        const [[companyRow]] = await connection.execute(`SELECT id FROM Company WHERE email = ?`, [company_email]);
        if (!companyRow) throw new Error("Company does not exist");

        const [[adminRow]] = await connection.execute(`SELECT id FROM Admin WHERE email = ?`, [admin_email]);
        if (!adminRow) throw new Error("Admin does not exist");

        const companyId = companyRow.id;
        const adminId = adminRow.id;

        // **Upload Staff Document to S3**
        if (!req.files || !req.files["document"]) {
            return res.status(400).json({ message: "Staff document (Aadhar/PAN) must be uploaded" });
        }
        const file = req.files["document"][0];
        const { key } = await uploadFile(file, phone_number);
        const uploadedDocument = key;

        // **Hash password**
        const hashedPassword = await bcrypt.hash(password, 10);

        // **Insert Staff**
        const staffQuery = `
            INSERT INTO Staff (first_name, last_name, date_of_birth, gender, nationality, phone_number, alt_phone_number,
                              email, alt_email, uploaded_documents_s3, company_id, admin_id, address1, address2, 
                              pincode, position, years_in_company, password_hash)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        const staffValues = [
            first_name, last_name, date_of_birth, gender, nationality, phone_number, alt_phone_number,
            email, alt_email, uploadedDocument, companyId, adminId,
            address1, address2, pincode, position, years_in_company, hashedPassword
        ];

        await connection.execute(staffQuery, staffValues);

        // **Delete OTP after successful registration**
        await db.execute(`DELETE FROM RegisterOtp WHERE identifier = ?`, [email]);

        await connection.commit();

        res.status(201).json({
            message: "Staff registered successfully",
            staff_document: uploadedDocument
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("❌ Error registering staff:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    } finally {
        if (connection) await connection.release();
    }
};

module.exports = { sendRegistrationOtp, registerStaff };
