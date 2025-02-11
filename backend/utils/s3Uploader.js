const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config();

// **AWS S3 Client Configuration**
const s3 = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "koncept-engineers-bucket";

// **Function to Generate Unique File Names**
const generateFileName = (file) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    return `${baseName}-${Date.now()}${ext}`;
};

// **Multer Storage for Uploading to S3**
const upload = multer({
    storage: multer.memoryStorage(), // ✅ Use memoryStorage instead of multerS3
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});

// **Upload File Function Using @aws-sdk/lib-storage**
const uploadFile = async (file) => {
    try {
        if (!file || !file.buffer) {
            throw new Error("File buffer is missing.");
        }

        const uniqueDir = `documents/${Date.now()}`;
        const filePath = `${uniqueDir}/${file.originalname}`;

        const upload = new Upload({
            client: s3,
            params: {
                Bucket: BUCKET_NAME,
                Key: filePath,
                Body: file.buffer, // ✅ Use file.buffer from multer's memoryStorage
                ContentType: file.mimetype
            }
        });

        const response = await upload.done();
        return response.Location; // ✅ Returns the S3 URL of the uploaded file
    } catch (error) {
        console.error("S3 Upload Error:", error);
        throw new Error("Failed to upload file to S3.");
    }
};

module.exports = { upload, uploadFile, s3 };
