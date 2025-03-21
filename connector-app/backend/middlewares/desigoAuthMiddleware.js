const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const jwt = require("jsonwebtoken");

// ✅ Load Local Database
const dbPath = path.resolve(__dirname, "../db/localDB.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error("❌ Error opening database:", err.message);
});

// ✅ Middleware to Verify Desigo Auth Token
const verifyDesigoAuthToken = (req, res, next) => {
    const desigoAuthHeader = req.headers["desigo-authorization"];
    const token = desigoAuthHeader && desigoAuthHeader.split(" ")[1];

    if (!token) {
        console.error("❌ No Desigo token provided in the request.");
        return res.status(401).json({ error: "Unauthorized: No Desigo Token Provided" });
    }

    console.log(`🔍 Received Desigo Token from Request: ${token}`);

    // ✅ Check if token exists in `DesigoAuthTokens`
    db.get("SELECT token, expires_at FROM DesigoAuthTokens WHERE token = ?", [token], (err, row) => {
        if (err) {
            console.error("❌ Database error:", err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (!row) {
            console.error("❌ Token not found in database. Possible mismatch or expired login.");
            return res.status(403).json({ error: "Forbidden: Invalid Token" });
        }

        console.log(`✅ Token exists in DB. Stored Token: ${row.token}`);
        console.log(`🔍 Token Expires At (UTC from DB): ${row.expires_at}`);
        
        // ✅ Compare expiration safely using UTC
        const tokenExpirationUTC = new Date(row.expires_at + "Z").getTime(); // Ensure it's treated as UTC
        const nowUTC = new Date().getTime();

        console.log(`🕒 Current UTC Time: ${new Date().toISOString()}`);
        console.log(`🔍 Expiration Check: ${tokenExpirationUTC} vs ${nowUTC}`);

        if (nowUTC >= tokenExpirationUTC) {
            console.error("❌ Token expired.");
            return res.status(403).json({ error: "Forbidden: Token Expired" });
        }

        // ✅ Optionally decode and attach token payload
        try {
            const decoded = jwt.verify(token, "desigo_secret"); // Ensure this matches your Desigo server secret
            req.desigoUser = decoded;
            req.desigoToken = token;
        } catch (decodeErr) {
            console.error("❌ Token could not be decoded:", decodeErr.message);
            return res.status(403).json({ error: "Forbidden: Invalid Token Format" });
        }

        console.log("✅ Desigo Auth Token Verified Successfully!");
        next(); // Continue to actual route
    });
};

module.exports = { verifyDesigoAuthToken };
