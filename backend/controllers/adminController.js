const db = require("../db/connector");
const bcrypt = require("bcrypt");
const { uploadFile } = require("../utils/s3Uploader");
const { sendOtpToEmail } = require("../utils/sendOtpEmail"); // ✅ Nodemailer for Email

// **✅ Send OTP for Admin Registration**
const sendRegistrationOtp = async (req, res) => {
    try {
        const { email, phone_number } = req.body; // ✅ Admin Email & Phone Required

        if (!email || !phone_number) {
            return res.status(400).json({ message: "Email and phone number are required" });
        }

        // ✅ Check if Admin Already Exists
        const [[adminRow]] = await db.execute(`SELECT id FROM Admin WHERE email = ?`, [email]);
        if (adminRow) {
            return res.status(400).json({ message: "Admin already exists. Try logging in." });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // ✅ Generate OTP

        // ✅ Send OTP to Admin Email
        const emailMessage = `
            Dear Admin,

            Your OTP for account registration is **${otp}**.  
            This OTP is valid for **10 minutes**.

            Regards,  
            Koncept Engineers Security Team
        `;

        const otpSent = await sendOtpToEmail(email, emailMessage);
        if (!otpSent.success) {
            return res.status(500).json({ message: "Failed to send OTP", error: otpSent.error });
        }

        // ✅ Store OTP in UTC format (10-minute validity)
        const otpQuery = `
            INSERT INTO RegisterOtp (identifier, otp, created_at, expires_at)
            VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 10 MINUTE))
            ON DUPLICATE KEY UPDATE 
            otp = ?, created_at = NOW(), expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE);
        `;
        await db.execute(otpQuery, [email, otp, otp]);

        console.log(`✅ OTP sent successfully to ${email} for Admin Registration`);

        res.status(200).json({ message: "OTP sent to Admin's email successfully" });

    } catch (error) {
        console.error("❌ Error sending OTP to Admin:", error);
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
            email, company_name, company_email, company_address1,
            company_address2, company_pincode, otp
        } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required for verification" });
        }

        // ✅ Validate OTP for Admin
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

        // ✅ Ensure Admin Does Not Exist Again
        const [[existingAdmin]] = await connection.execute(`SELECT id FROM Admin WHERE email = ?`, [email]);
        if (existingAdmin) throw new Error("Admin already registered.");

        // ✅ Upload Aadhar, PAN, GST Documents to S3
        const uploadedFiles = {};
        const fileFields = ["aadhar", "pan", "gst"];
        for (const field of fileFields) {
            if (!req.files || !req.files[field]) {
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
            uploadedFiles.aadhar, company_name, company_email, null, // `null` for alternative email
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
        await db.execute(`DELETE FROM RegisterOtp WHERE identifier = ?`, [email]);

        await connection.commit();

        res.status(201).json({
            message: "Admin registered successfully",
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
