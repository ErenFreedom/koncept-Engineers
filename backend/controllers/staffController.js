const db = require("../db/connector");
const bcrypt = require("bcrypt");
const { uploadFile } = require("../utils/s3Uploader");

const registerStaff = async (req, res) => {
    try {
        const {
            first_name, last_name, date_of_birth, gender, nationality,
            phone_number, alt_phone_number, email, alt_email,
            address1, address2, pincode, position, years_in_company, password,
            company_id, admin_id
        } = req.body;

        // Validate required fields
        if (!first_name || !last_name || !date_of_birth || !gender || !nationality || !phone_number || !email || !password || !company_id || !admin_id) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Ensure file is uploaded
        if (!req.files || !req.files["document"]) {
            return res.status(400).json({ message: "Staff document (Aadhar/PAN) must be uploaded" });
        }

        // Upload document to S3
        const file = req.files["document"][0];
        const { key } = await uploadFile(file, phone_number);
        const uploadedDocument = key;

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
            email, alt_email, uploadedDocument, company_id, admin_id,
            address1, address2, pincode, position, years_in_company, hashedPassword
        ];

        await db.execute(staffQuery, staffValues);

        res.status(201).json({
            message: "Staff registered successfully",
            staff_document: uploadedDocument
        });

    } catch (error) {
        console.error("❌ Error registering staff:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

module.exports = { registerStaff };
