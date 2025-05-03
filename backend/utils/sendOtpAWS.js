const AWS = require("aws-sdk");
require("dotenv").config();

const sns = new AWS.SNS({
    accessKeyId: process.env.AWS_SNS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SNS_SECRET_ACCESS_KEY,
    region: "us-east-1" 
});

const sendOtpToPhone = async (phoneNumber, otp) => {
    try {
        const params = {
            Message: `Your OTP is: ${otp}`,
            PhoneNumber: phoneNumber,
        };

        const result = await sns.publish(params).promise();
        console.log("📲 OTP Sent Successfully via AWS SNS:", result.MessageId);
        return true;
    } catch (error) {
        console.error("❌ AWS SNS Error:", error);
        return false;
    }
};

module.exports = { sendOtpToPhone };
