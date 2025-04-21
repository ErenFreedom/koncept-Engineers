const db = require("../db/connector");
const bcrypt = require("bcrypt");

const updateAdminProfile = async (req, res) => {
  const { adminId } = req.params;
  const {
    password,
    // Admin Fields
    first_name, middle_name, last_name,
    date_of_birth, nationality, address1, address2,
    pincode, phone_number, email, alt_email, landline,

    // Company Fields
    company_name, company_email, company_alt_email,
    company_address1, company_address2, company_pincode
  } = req.body;

  try {
    // ✅ 1. Fetch admin and password_hash
    const [[admin]] = await db.execute(
      `SELECT password_hash, company_id FROM Admin WHERE id = ?`,
      [adminId]
    );

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // ✅ 2. Check password
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // ✅ 3. Update Admin info
    await db.execute(
      `UPDATE Admin SET 
          first_name = ?, middle_name = ?, last_name = ?, date_of_birth = ?, nationality = ?, 
          address1 = ?, address2 = ?, pincode = ?, phone_number = ?, 
          email = ?, alt_email = ?, landline = ?
       WHERE id = ?`,
      [
        first_name, middle_name, last_name, date_of_birth || null, nationality,
        address1, address2, pincode, phone_number,
        email, alt_email, landline,
        adminId
      ]
    );

    // ✅ 4. Update Company info
    await db.execute(
      `UPDATE Company SET 
          name = ?, email = ?, alt_email = ?, address1 = ?, address2 = ?, pincode = ?
       WHERE id = ?`,
      [
        company_name, company_email, company_alt_email,
        company_address1, company_address2, company_pincode,
        admin.company_id
      ]
    );

    // ✅ 5. Return updated Admin profile (optional but helpful for frontend sync)
    const [[updatedAdmin]] = await db.execute(
      `SELECT * FROM Admin WHERE id = ?`,
      [adminId]
    );

    res.status(200).json({
      message: "✅ Profile updated successfully.",
      updatedAdmin
    });

  } catch (err) {
    console.error("❌ Error updating profile:", err);
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message
    });
  }
};

module.exports = { updateAdminProfile };
