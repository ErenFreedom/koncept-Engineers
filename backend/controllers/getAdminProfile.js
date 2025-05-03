const db = require("../db/connector");

const getAdminProfile = async (req, res) => {
    try {
        const { adminId } = req.params;

        if (!adminId) {
            return res.status(400).json({ message: "Admin ID is required" });
        }

        
        const [results] = await db.execute(
            `SELECT 
                a.id AS admin_id,
                a.first_name, a.middle_name, a.last_name, a.date_of_birth,
                a.nationality, a.address1, a.address2, a.pincode,
                a.phone_number, a.email, a.alt_email, a.landline,
                a.aadhar_pan_passport_s3, a.company_id, a.created_at AS admin_created_at,

                c.name AS company_name, c.email AS company_email,
                c.alt_email AS company_alt_email, c.address1 AS company_address1,
                c.address2 AS company_address2, c.pincode AS company_pincode,
                c.pan_s3, c.gst_s3, c.created_at AS company_created_at

            FROM Admin a
            JOIN Company c ON a.company_id = c.id
            WHERE a.id = ?`,
            [adminId]
        );

        if (results.length === 0) {
            return res.status(404).json({ message: "Admin or associated company not found" });
        }

        res.status(200).json({ profile: results[0] });
    } catch (error) {
        console.error("❌ Error fetching admin profile:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

module.exports = { getAdminProfile };
