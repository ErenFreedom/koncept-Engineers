const db = require("../db/connector");
const bcrypt = require("bcrypt");
const { uploadFile } = require("../utils/s3Uploader");

const registerAdmin = async (req, res) => {
    try {
        const {
            first_name, middle_name, last_name, date_of_birth, nationality,
            address1, address2, pincode, phone_number, landline, password,
            company_name, company_address1, company_address2, company_pincode
        } = req.body;

        // Validate required fields
        if (!first_name || !last_name || !date_of_birth || !phone_number || !password || !company_name || !company_address1 || !company_pincode) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Ensure files are uploaded
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

        // Insert company details
        const companyQuery = `
            INSERT INTO Company (name, address1, address2, pincode, pan_s3, gst_s3)
            VALUES (?, ?, ?, ?, ?, ?);
        `;
        const companyValues = [company_name, company_address1, company_address2, company_pincode, uploadedFiles.pan, uploadedFiles.gst];

        const [companyResult] = await db.execute(companyQuery, companyValues);
        const companyId = companyResult.insertId;

        // Insert admin details
        const adminQuery = `
            INSERT INTO Admin (first_name, middle_name, last_name, date_of_birth, nationality, address1, address2, pincode,
                               phone_number, landline, password_hash, aadhar_pan_passport_s3, company_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        const adminValues = [
            first_name, middle_name, last_name, date_of_birth, nationality,
            address1, address2, pincode, phone_number, landline,
            hashedPassword, uploadedFiles.aadhar, companyId
        ];

        await db.execute(adminQuery, adminValues);

        res.status(201).json({
            message: "Admin and Company registered successfully",
            company_id: companyId
        });

    } catch (error) {
        console.error("❌ Error registering admin and company:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

module.exports = { registerAdmin };
