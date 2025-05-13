const jwt = require("jsonwebtoken");

const verifyCloudToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or invalid Authorization header" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 

    if (!decoded || !decoded.adminId || !decoded.companyId) {
      return res.status(403).json({ message: "Invalid token payload" });
    }

    req.admin = {
      adminId: decoded.adminId,
      companyId: decoded.companyId,
    };

    next();
  } catch (err) {
    console.error("❌ JWT Verification Failed:", err.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyCloudToken;
