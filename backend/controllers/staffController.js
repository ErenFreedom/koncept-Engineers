const db = require("../db/connector");
const bcrypt = require("bcrypt");
const { uploadFile } = require("../utils/s3Uploader");
const sendOtpSms = require("../utils/sendOtpSms"); // ✅ Same as Admin Controller
const { sendOtpToEmail } = require("../utils/sendOtpEmail"); // ✅ Nodemailer for Email

// **Send OTP for Staff Registration**
const sendRegistrationOtp = async (req, res) => {
    try {
        const { identifier } = req.body; // Can be phone number or email

        if (!identifier) {
            return res.status(400).json({ message: "Identifier (email or phone) is required" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate OTP

        // Send OTP via Email or SMS
        let otpSent = { success: false };
        if (identifier.includes("@")) {
            otpSent = await sendOtpToEmail(identifier, otp);
        } else {
            otpSent = await sendOtpSms(identifier, otp); // ✅ Same function call as in Admin Controller
        }

        if (!otpSent.success) {
            return res.status(500).json({ message: "Failed to send OTP", error: otpSent.error });
        }

        // ✅ Store OTP directly in UTC format
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

        if ((!phone_number && !email) || !company_email || !admin_email || !otp) {
            return res.status(400).json({ message: "Phone number or email is required for OTP validation" });
        }

        // ✅ Validate OTP using UTC_TIMESTAMP()
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

        // ✅ Delete OTP after successful registration
        await db.execute(`DELETE FROM RegisterOtp WHERE identifier = ? OR identifier = ?`, [email, phone_number]);

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
