const db = require("../db/connector");
const bcrypt = require("bcrypt");
const { uploadFile } = require("../utils/s3Uploader");

const registerAdmin = async (req, res) => {
    try {
        const {
            first_name, middle_name, last_name, date_of_birth, nationality,
            address1, address2, pincode, phone_number, landline, password,
            email, alt_email, // Admin Email
            company_name, company_email, company_alt_email, // Company Emails
            company_address1, company_address2, company_pincode
        } = req.body;

        // Validate required fields
        if (!first_name || !last_name || !date_of_birth || !phone_number || !password || 
            !email || !company_name || !company_email || !company_address1 || !company_pincode) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Ensure required files are uploaded
        if (!req.files || !req.files["aadhar"] || !req.files["pan"] || !req.files["gst"]) {
            return res.status(400).json({ message: "Aadhar, PAN, and GST files must be uploaded" });
        }

        // Upload documents to S3
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

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Start Transaction to ensure Atomicity
        await db.beginTransaction();

        // Insert company details with email fields
        const companyQuery = `
            INSERT INTO Company (name, email, alt_email, address1, address2, pincode, pan_s3, gst_s3)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `;
        const companyValues = [
            company_name, company_email, company_alt_email, company_address1, 
            company_address2, company_pincode, uploadedFiles.pan, uploadedFiles.gst
        ];
        const [companyResult] = await db.execute(companyQuery, companyValues);
        const companyId = companyResult.insertId;

        // Insert admin details with email fields
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
        await db.execute(adminQuery, adminValues);

        // **Call Procedure to Initialize Company-Specific Sensor Tables**
        const procedureCall = `CALL RegisterAdminAndCompany(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const procedureParams = [
            first_name, middle_name, last_name, date_of_birth, nationality,
            address1, address2, pincode, phone_number, landline, hashedPassword,
            uploadedFiles.aadhar, company_name, company_address1, company_address2,
            company_pincode, uploadedFiles.pan, uploadedFiles.gst
        ];

        await db.execute(procedureCall, procedureParams);

        // Commit Transaction
        await db.commit();

        // Log Success
        console.log(`✅ Admin and Company registered successfully. Company ID: ${companyId}`);

        res.status(201).json({
            message: "Admin and Company registered successfully, and procedures executed.",
            company_id: companyId
        });

    } catch (error) {
        // Rollback transaction in case of error
        await db.rollback();
        
        console.error("❌ Error registering admin and company:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

module.exports = { registerAdmin };
