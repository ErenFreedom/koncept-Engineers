const db = require("../db/connector");
const bcrypt = require("bcrypt");



const verifyAdminPassword = async (req, res) => {
  const { adminId, password } = req.body;

  if (!adminId || !password) {
    return res.status(400).json({ message: "Admin ID and password are required." });
  }

  try {
    const [[admin]] = await db.execute(
      `SELECT password_hash FROM Admin WHERE id = ?`,
      [adminId]
    );

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    res.status(200).json({ success: true, message: "Password verified" });
  } catch (err) {
    console.error("❌ Error verifying password:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};


const updateAdminProfile = async (req, res) => {
  const { adminId } = req.params;
  const {
    password,
    
    first_name, middle_name, last_name,
    date_of_birth, nationality, address1, address2,
    pincode, phone_number, email, alt_email, landline,

    
    company_name, company_email, company_alt_email,
    company_address1, company_address2, company_pincode
  } = req.body;

  try {
    
    const [[admin]] = await db.execute(
      `SELECT password_hash, company_id FROM Admin WHERE id = ?`,
      [adminId]
    );

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    
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

module.exports = { updateAdminProfile,verifyAdminPassword };
