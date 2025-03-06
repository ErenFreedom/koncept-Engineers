const db = require("../db/connector");
const bcrypt = require("bcrypt");
const { uploadFile } = require("../utils/s3Uploader");

const registerStaff = async (req, res) => {
    let connection;
    try {
        const {
            first_name, last_name, date_of_birth, gender, nationality,
            phone_number, alt_phone_number, email, alt_email,
            address1, address2, pincode, position, years_in_company, password,
            company_email, admin_email // Use emails instead of IDs
        } = req.body;

        if (!first_name || !last_name || !date_of_birth || !gender || !nationality || !phone_number || !email || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        if (!req.files || !req.files["document"]) {
            return res.status(400).json({ message: "Staff document (Aadhar/PAN) must be uploaded" });
        }

        // Upload document to S3
        const file = req.files["document"][0];
        const { key } = await uploadFile(file, phone_number);
        const uploadedDocument = key;

        // **Get connection for transaction**
        connection = await db.getConnection();
        await connection.beginTransaction();

        // **Retrieve Company ID and Admin ID from emails**
        const [[companyRow]] = await connection.execute(`SELECT id FROM Company WHERE email = ?`, [company_email]);
        if (!companyRow) throw new Error("Company does not exist");

        const [[adminRow]] = await connection.execute(`SELECT id FROM Admin WHERE email = ?`, [admin_email]);
        if (!adminRow) throw new Error("Admin does not exist");

        const companyId = companyRow.id;
        const adminId = adminRow.id;

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
            email, alt_email, uploadedDocument, companyId, adminId,
            address1, address2, pincode, position, years_in_company, hashedPassword
        ];

        await connection.execute(staffQuery, staffValues);
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

module.exports = { registerStaff };
