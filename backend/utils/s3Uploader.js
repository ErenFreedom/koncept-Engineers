const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const multer = require("multer");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();


const s3 = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "koncept-engineers-bucket";


const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, 
});


const generateFilePath = (phone_number, file) => {
    if (!file || !file.originalname) throw new Error("Invalid file data received.");
    if (!phone_number) throw new Error("Phone number is required for unique directory.");

    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    return `documents/${phone_number}/${baseName}-${Date.now()}${ext}`;
};


const uploadFile = async (file, phone_number) => {
    try {
        if (!file || !file.buffer) throw new Error("File buffer is missing.");
        if (!phone_number) throw new Error("Phone number is required for unique directory.");

        const filePath = generateFilePath(phone_number, file);

        const upload = new Upload({
            client: s3,
            params: {
                Bucket: BUCKET_NAME,
                Key: filePath,
                Body: Buffer.from(file.buffer), 
                ContentType: file.mimetype
            }
        });

        const response = await upload.done();
        return { location: response.Location, key: filePath }; 
    } catch (error) {
        console.error("❌ S3 Upload Error:", error);
        throw new Error("Failed to upload file to S3.");
    }
};

module.exports = { upload, uploadFile, s3 };
