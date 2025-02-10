const db = require("../db/connector");
const bcrypt = require("bcrypt");
const axios = require("axios"); // To communicate with Python API

const PYTHON_API_URL = "http://ec2-98-84-241-148.compute-1.amazonaws.com:5000/validate-docs"; // Change this to actual EC2 IP

// Register Admin & Company after validation
const registerAdmin = async (req, res) => {
    try {
        const {
            first_name, middle_name, last_name, date_of_birth, nationality,
            address1, address2, pincode, phone_number, landline, password,
            aadhar_pan_passport_s3, company_name, company_address1, company_address2,
            company_pincode, pan_s3, gst_s3
        } = req.body;

        // Validate required fields
        if (!first_name || !last_name || !date_of_birth || !phone_number || !password || !company_name || !company_address1 || !company_pincode) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Call Python API for document validation
        const validationPayload = {
            bucket: "koncept-engineers-bucket", // Change to actual S3 bucket name
            documents: [aadhar_pan_passport_s3, pan_s3, gst_s3]
        };

        const validationResponse = await axios.post(PYTHON_API_URL, validationPayload);
        const validationResults = validationResponse.data;

        // Extract validation status
        const adminDocument = validationResults.find(doc => doc.Document === aadhar_pan_passport_s3);
        const companyPanDocument = validationResults.find(doc => doc.Document === pan_s3);
        const companyGstDocument = validationResults.find(doc => doc.Document === gst_s3);

        if (!adminDocument.Valid || !companyPanDocument.Valid || !companyGstDocument.Valid) {
            return res.status(400).json({
                message: "Document validation failed",
                details: validationResults
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert company details
        const companyQuery = `
            INSERT INTO Company (name, address1, address2, pincode, pan_s3, gst_s3)
            VALUES (?, ?, ?, ?, ?, ?);
        `;
        const companyValues = [company_name, company_address1, company_address2, company_pincode, pan_s3, gst_s3];

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
            hashedPassword, aadhar_pan_passport_s3, companyId
        ];

        await db.execute(adminQuery, adminValues);

        res.status(201).json({
            message: "Admin and Company registered successfully",
            company_id: companyId
        });

    } catch (error) {
        console.error("Error registering admin and company:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

module.exports = { registerAdmin };
