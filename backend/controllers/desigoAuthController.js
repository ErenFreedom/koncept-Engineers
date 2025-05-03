const db = require("../db/connector");
const bcrypt = require("bcrypt");


const storeDesigoCredentials = async (req, res) => {
    try {
        const { admin_identifier, username, password } = req.body;

        if (!admin_identifier || !username || !password) {
            return res.status(400).json({ message: "Admin identifier, username, and password are required" });
        }

       
        const hashedPassword = await bcrypt.hash(password, 10);

        
        const query = `
            INSERT INTO DesigoCC_Credentials (admin_identifier, username, password_encrypted, created_at)
            VALUES (?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE username = ?, password_encrypted = ?, created_at = NOW();
        `;
        await db.execute(query, [admin_identifier, username, hashedPassword, username, hashedPassword]);

        res.status(200).json({ message: "Desigo CC Credentials stored successfully" });

    } catch (error) {
        console.error("❌ Error storing Desigo CC Credentials:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

module.exports = { storeDesigoCredentials };
