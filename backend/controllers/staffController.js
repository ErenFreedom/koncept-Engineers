const db = require("../db/connector");
const bcrypt = require("bcrypt");
const { uploadFile } = require("../utils/s3Uploader");

const registerStaff = async (req, res) => {
    try {
        const {
            first_name, last_name, date_of_birth, gender, nationality,
            phone_number, alt_phone_number, email, alt_email,
            address1, address2, pincode, position, years_in_company, password,
            company_email, admin_email // These are used to find IDs
        } = req.body;

        // Validate required fields
        if (!first_name || !last_name || !date_of_birth || !gender || !nationality || !phone_number || !email || !password || !company_email || !admin_email) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Step 1: Validate company email and fetch company_id
        const [companyResult] = await db.execute("SELECT id FROM Company WHERE email = ?", [company_email]);
        if (companyResult.length === 0) {
            return res.status(400).json({ message: "Invalid company email. No company found." });
        }
        const company_id = companyResult[0].id;

        // Step 2: Validate admin email and fetch admin_id
        const [adminResult] = await db.execute("SELECT id FROM Admin WHERE email = ?", [admin_email]);
        if (adminResult.length === 0) {
            return res.status(400).json({ message: "Invalid admin email. No admin found." });
        }
        const admin_id = adminResult[0].id;

        // Step 3: Ensure file is uploaded
        if (!req.files || !req.files["document"]) {
            return res.status(400).json({ message: "Staff document (Aadhar/PAN) must be uploaded" });
        }

        // Step 4: Upload document to S3
        const file = req.files["document"][0];
        const { key } = await uploadFile(file, phone_number);
        const uploadedDocument = key;

        // Step 5: Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Step 6: Insert staff into the database using retrieved company_id and admin_id
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
