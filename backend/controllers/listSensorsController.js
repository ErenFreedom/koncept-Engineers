const db = require("../db/connector");
const jwt = require("jsonwebtoken");

/** ✅ Extract Admin Details from Token */
const getAdminDetailsFromToken = (req) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer Token
        if (!token) return null;

        const decoded = jwt.verify(token, process.env.JWT_SECRET_APP);

        console.log("🔍 Extracted Admin Details from Token:", decoded);

        const companyId = decoded.companyId || decoded.company_id;
        if (!companyId) {
            console.error("❌ Error: companyId is undefined in JWT", decoded);
            return null;
        }

        return { companyId, adminId: decoded.adminId };
    } catch (error) {
        console.error("❌ Error decoding JWT:", error.message);
        return null;
    }
};

/** ✅ API to Fetch All Sensors in SensorBank_companyid */
const listSensors = async (req, res) => {
    try {
        // ✅ Validate Token & Get Admin ID
        const adminDetails = getAdminDetailsFromToken(req);
        if (!adminDetails) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }
        const { companyId } = adminDetails;

        console.log(`🔍 Fetching Sensors for Company ${companyId}`);

        // ✅ Fetch Sensors from Cloud DB (`SensorBank_companyid`)
        const [sensors] = await db.execute(`SELECT * FROM SensorBank_${companyId}`);

        if (!sensors || sensors.length === 0) {
            return res.status(404).json({ message: "No sensors found" });
        }

        console.log(`✅ Found ${sensors.length} sensors`);
        res.status(200).json({ sensors });

    } catch (error) {
        console.error("❌ Error fetching SensorBank:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

/** ✅ Export Function */
module.exports = { listSensors };
