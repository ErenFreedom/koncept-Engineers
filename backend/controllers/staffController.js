const db = require("../db/connector");
const bcrypt = require("bcrypt");
const { uploadFile } = require("../utils/s3Uploader");
const { sendOtpToEmail } = require("../utils/sendOtpEmail"); // ✅ Nodemailer for Email

// **✅ Send OTP to Admin for Staff Registration**
const sendRegistrationOtp = async (req, res) => {
    try {
        const { admin_email, staff_name, staff_phone } = req.body; // ✅ Admin Email, Staff Name & Phone Required

        if (!admin_email || !staff_name || !staff_phone) {
            return res.status(400).json({ message: "Admin email, staff name, and staff phone are required" });
        }

        // ✅ Check if Admin Exists
        const [[adminRow]] = await db.execute(`SELECT id FROM Admin WHERE email = ?`, [admin_email]);
        if (!adminRow) {
            return res.status(400).json({ message: "Admin does not exist" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // ✅ Generate OTP

        // ✅ Send OTP to Admin's Email with Staff Details
        const emailMessage = `
            Dear Admin,

            A staff member is attempting to register under your supervision.

            - **Staff Name:** ${staff_name}
            - **Phone Number:** ${staff_phone}

            If you authorize this registration, please share the following OTP with them:

            **OTP:** ${otp} (Valid for 10 minutes)

            If this request was not made by you, please ignore this email.

            Regards,  
            Koncept Engineers Security Team
        `;

        const otpSent = await sendOtpToEmail(admin_email, emailMessage);

        if (!otpSent.success) {
            return res.status(500).json({ message: "Failed to send OTP to Admin", error: otpSent.error });
        }

        // ✅ Store OTP in UTC format (10-minute validity)
        const otpQuery = `
            INSERT INTO RegisterOtp (identifier, otp, created_at, expires_at)
            VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 10 MINUTE))
            ON DUPLICATE KEY UPDATE otp = ?, created_at = NOW(), expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE);
        `;
        await db.execute(otpQuery, [admin_email, otp, otp]);

        console.log(`✅ OTP sent successfully to Admin (${admin_email}) for Staff Registration`);

        res.status(200).json({ message: "OTP sent to Admin's email successfully" });

    } catch (error) {
        console.error("❌ Error sending OTP to Admin:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// **✅ Verify OTP & Register Staff**
const registerStaff = async (req, res) => {
    let connection;
    try {
        const {
            first_name, last_name, date_of_birth, gender, nationality,
            phone_number, alt_phone_number, email, alt_email,
            address1, address2, pincode, position, years_in_company, password,
            company_email, admin_email, otp
        } = req.body;

        if (!admin_email || !company_email || !otp) {
            return res.status(400).json({ message: "Admin email, company email, and OTP are required for verification" });
        }

        // ✅ Validate OTP for Admin
        const otpQuery = `
            SELECT * FROM RegisterOtp 
            WHERE identifier = ? AND otp = ? 
            AND expires_at > UTC_TIMESTAMP();
        `;
        const [otpResults] = await db.execute(otpQuery, [admin_email, otp]);

        if (otpResults.length === 0) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // ✅ OTP is valid, proceed with registration
        connection = await db.getConnection();
        await connection.beginTransaction();

        // **Retrieve Company ID and Admin ID**
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
        await db.execute(`DELETE FROM RegisterOtp WHERE identifier = ?`, [admin_email]);

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
