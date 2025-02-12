const db = require("../db/connector");
const bcrypt = require("bcrypt");
const axios = require("axios");
const { uploadFile } = require("../utils/s3Uploader");

const PYTHON_API_URL = "http://ec2-98-84-241-148.compute-1.amazonaws.com:5000/validate-docs"; // Change this to actual EC2 IP

const registerStaff = async (req, res) => {
    try {
        const {
            first_name, last_name, date_of_birth, gender, nationality,
            phone_number, alt_phone_number, email, alt_email,
            address1, address2, pincode, position, years_in_company, password,
            company_id, admin_id
        } = req.body;

        if (!first_name || !last_name || !date_of_birth || !gender || !nationality || !phone_number || !email || !password || !company_id || !admin_id) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        if (!req.files || !req.files["document"]) {
            return res.status(400).json({ message: "Staff document (Aadhar/PAN) must be uploaded" });
        }

        // Generate unique directory for this staff member
        const uploadedFiles = {};

        // Upload documents to S3
        const file = req.files["document"][0];
        const { key } = await uploadFile(file, phone_number);
        uploadedFiles.document = key;

        // Call Python API for validation
        const validationPayload = {
            bucket: "koncept-engineers-bucket",
            documents: [uploadedFiles.document]
        };

        const validationResponse = await axios.post(PYTHON_API_URL, validationPayload);
        const validationResults = validationResponse.data;

        const staffDocument = validationResults.find(doc => doc.Document === uploadedFiles.document);

        if (!staffDocument.Valid) {
            return res.status(400).json({
                message: "Document validation failed",
                details: validationResults
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert staff into the database
        const staffQuery = `
            INSERT INTO Staff (first_name, last_name, date_of_birth, gender, nationality, phone_number, alt_phone_number,
                              email, alt_email, uploaded_documents_s3, company_id, admin_id, address1, address2, 
                              pincode, position, years_in_company, password_hash)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        const staffValues = [
            first_name, last_name, date_of_birth, gender, nationality, phone_number, alt_phone_number,
            email, alt_email, uploadedFiles.document, company_id, admin_id,
            address1, address2, pincode, position, years_in_company, hashedPassword
        ];

        await db.execute(staffQuery, staffValues);

        res.status(201).json({
            message: "Staff registered successfully",
            staff_document: uploadedFiles.document
        });

    } catch (error) {
        console.error("❌ Error registering staff:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

module.exports = { registerStaff };
