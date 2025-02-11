const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

// AWS S3 Client Configuration
const s3 = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "koncept-engineers-bucket";

// Function to Generate Unique File Names
const generateFileName = (file) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    return `${baseName}-${Date.now()}${ext}`;
};

// Multer Storage for Uploading to S3
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: BUCKET_NAME,
        acl: "public-read",  // Change if needed
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            if (!req.body.phone_number) {
                return cb(new Error("Phone number is required for file upload directory."));
            }
            const uniqueDir = `documents/${req.body.phone_number}`; // Creates a unique directory per admin
            const filePath = `${uniqueDir}/${file.fieldname}-${Date.now()}-${file.originalname}`;
            cb(null, filePath);
        }
    }),
});

// **Upload File Function** (For Manual Upload)
const uploadFile = async (fileBuffer, key, mimeType) => {
    try {
        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: key,
            Body: fileBuffer,
            ContentType: mimeType,
            ACL: "public-read",
        };

        const command = new PutObjectCommand(uploadParams);
        await s3.send(command);

        return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
    } catch (error) {
        console.error("S3 Upload Error:", error);
        throw new Error("Failed to upload file to S3.");
    }
};

module.exports = { upload, uploadFile, s3 };
