const db = require("../db/connector");
const bcrypt = require("bcrypt");
const axios = require("axios");
const { uploadFile } = require("../utils/s3Uploader");

const PYTHON_API_URL = "http://ec2-98-84-241-148.compute-1.amazonaws.com:5000/validate-docs"; // ✅ Corrected API URL format

const registerAdmin = async (req, res) => {
    try {
        const {
            first_name, middle_name, last_name, date_of_birth, nationality,
            address1, address2, pincode, phone_number, landline, password,
            company_name, company_address1, company_address2, company_pincode
        } = req.body;

        if (!first_name || !last_name || !date_of_birth || !phone_number || !password || !company_name || !company_address1 || !company_pincode) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // ✅ Ensure files are present
        if (!req.files || !req.files["aadhar"] || !req.files["pan"] || !req.files["gst"]) {
            return res.status(400).json({ message: "All document uploads (Aadhar, PAN, GST) are required." });
        }

        // ✅ Generate unique directory for the admin based on phone number
        const uniqueDir = `documents/${phone_number}`;

        // ✅ Upload documents to S3
        const uploadedFiles = {};
        const fileFields = ["aadhar", "pan", "gst"];

        for (const field of fileFields) {
            const file = req.files[field][0];
            const filePath = `${uniqueDir}/${file.originalname}`;

            // ✅ Upload to S3
            uploadedFiles[field] = await uploadFile(file.buffer, filePath, file.mimetype);
        }

        // ✅ Call Python API for validation
        const validationPayload = {
            bucket: "koncept-engineers-bucket",
            documents: [uploadedFiles.aadhar, uploadedFiles.pan, uploadedFiles.gst]
        };

        const validationResponse = await axios.post(PYTHON_API_URL, validationPayload, {
            headers: { "Content-Type": "application/json" }
        });

        const validationResults = validationResponse.data;

        // ✅ Ensure all three documents are valid
        const adminDocument = validationResults.find(doc => doc.Document.includes("aadhar"));
        const companyPanDocument = validationResults.find(doc => doc.Document.includes("pan"));
        const companyGstDocument = validationResults.find(doc => doc.Document.includes("gst"));

        if (!adminDocument.Valid || !companyPanDocument.Valid || !companyGstDocument.Valid) {
            return res.status(400).json({
                message: "Document validation failed",
                details: validationResults
            });
        }

        // ✅ Hash password securely
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Insert company into database
        const companyQuery = `
            INSERT INTO Company (name, address1, address2, pincode, pan_s3, gst_s3)
            VALUES (?, ?, ?, ?, ?, ?);
        `;
        const companyValues = [company_name, company_address1, company_address2, company_pincode, uploadedFiles.pan, uploadedFiles.gst];

        const [companyResult] = await db.execute(companyQuery, companyValues);
        const companyId = companyResult.insertId; // ✅ Get the company ID

        // ✅ Insert admin into database
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

        // ✅ Return success response
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
