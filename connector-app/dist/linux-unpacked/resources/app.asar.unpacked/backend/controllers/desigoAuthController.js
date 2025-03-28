const axios = require("axios");
const db = require("../db/localDB"); // Import Local SQLite DB
require("dotenv").config();

/** ✅ Fetch Token from Desigo Server and Store in Local DB */
const saveDesigoToken = async (req, res) => {
    try {
        const { username, token } = req.body;

        if (!username || !token) {
            return res.status(400).json({ message: "Username and Token are required" });
        }

        console.log(`📝 Storing Desigo token for user: ${username}`);

        // ✅ Generate timestamps in UTC using JavaScript
        const createdAt = new Date().toISOString(); // Current UTC time
        const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(); // +6 hours in UTC

        db.run(`DELETE FROM DesigoAuthTokens WHERE username = ?`, [username], function (err) {
            if (err) {
                console.error("❌ Error deleting old Desigo token:", err.message);
                return res.status(500).json({ message: "Database error: Unable to delete old token" });
            }
            console.log("✅ Old token deleted (if existed). Proceeding with insert...");

            db.run(
                `INSERT INTO DesigoAuthTokens (username, token, expires_at, created_at) 
                 VALUES (?, ?, ?, ?)`,
                [username, token, expiresAt, createdAt],
                function (err) {
                    if (err) {
                        console.error("❌ Error inserting new Desigo token:", err.message);
                        return res.status(500).json({ message: "Database error: Unable to store token" });
                    }
                    console.log("✅ Token successfully saved in DesigoAuthTokens!");
                    res.status(200).json({ message: "Token stored successfully" });
                }
            );
        });
    } catch (error) {
        console.error("❌ Error saving Desigo token:", error.message);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


/** ✅ Fetch Token from Desigo Server */
const getDesigoAuthToken = async (req, res) => {
    try {
        const { apiUrl, username, password } = req.body;

        if (!apiUrl || !username || !password) {
            return res.status(400).json({ message: "API URL, Username, and Password are required" });
        }

        console.log("🔍 Requesting token from Desigo Server:", apiUrl);

        const response = await axios.post(apiUrl, `grant_type=password&username=${username}&password=${password}`, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        if (!response.data || !response.data.access_token) {
            return res.status(500).json({ message: "Invalid response from Desigo server" });
        }

        const accessToken = response.data.access_token;
        console.log("✅ Desigo Token Received:", accessToken);

        // ✅ Send token to frontend (Frontend will call `saveDesigoToken` separately)
        res.status(200).json({ message: "Token retrieved successfully", accessToken });
    } catch (error) {
        console.error("❌ Error fetching Desigo token:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            message: "Failed to fetch token",
            error: error.response?.data || error.message
        });
    }
};

/** ✅ Retrieve the latest Desigo Token */
const getStoredDesigoToken = async (req, res) => {
    try {
        const { username } = req.query;

        if (!username) {
            return res.status(400).json({ message: "Username is required" });
        }

        db.get(`SELECT token, expires_at FROM DesigoAuthTokens WHERE username = ?`, [username], (err, row) => {
            if (err) {
                console.error("❌ Error retrieving Desigo token:", err.message);
                return res.status(500).json({ message: "Database error", error: err.message });
            }
            if (!row) {
                return res.status(404).json({ message: "No token found for this user" });
            }

            res.status(200).json({ token: row.token, expiresAt: row.expires_at });
        });
    } catch (error) {
        console.error("❌ Error retrieving stored token:", error.message);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

/** ✅ Delete the stored Desigo Token */
const deleteDesigoToken = async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ message: "Username is required" });
        }

        db.run(`DELETE FROM DesigoAuthTokens WHERE username = ?`, [username], (err) => {
            if (err) {
                console.error("❌ Error deleting Desigo token:", err.message);
                return res.status(500).json({ message: "Database error", error: err.message });
            }
            res.status(200).json({ message: "Token deleted successfully" });
        });
    } catch (error) {
        console.error("❌ Error deleting token:", error.message);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

module.exports = {
    getDesigoAuthToken,
    getStoredDesigoToken,
    deleteDesigoToken,
    saveDesigoToken ,
};
