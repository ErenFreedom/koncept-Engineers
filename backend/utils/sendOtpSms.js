const twilio = require("twilio");
require("dotenv").config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendOtpSms = async (phoneNumber, otp) => {
    try {
        const message = await client.messages.create({
            body: `Your OTP is: ${otp}. It is valid for 2 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber,
        });

        console.log(`✅ OTP sent successfully to ${phoneNumber}. Message SID: ${message.sid}`);
        return { success: true, sid: message.sid };
    } catch (error) {
        console.error("❌ Error sending OTP via SMS:", error);
        return { success: false, error: error.message };
    }
};

module.exports = sendOtpSms;
