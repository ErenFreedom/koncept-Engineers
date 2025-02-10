const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

// Configure AWS SDK
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-east-1",
});

const s3 = new AWS.S3();
const BUCKET_NAME = "koncept-engineers-bucket";

// Multer Storage for Uploading to S3
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: BUCKET_NAME,
        acl: "public-read",
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            const uniqueDir = `documents/${req.body.phone_number}`;
            const filePath = `${uniqueDir}/${file.fieldname}-${Date.now()}-${file.originalname}`;
            cb(null, filePath);
        },
    }),
});

// Upload File Function
const uploadFile = async (fileBuffer, key, mimeType) => {
    const params = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType,
        ACL: "public-read",
    };

    return s3.upload(params).promise();
};

module.exports = { upload, uploadFile };
