const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendOtpToEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP is: ${otp}. Please do not share this with anyone.`,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 OTP Sent Successfully to ${email}, Message ID: ${info.messageId}`);

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("❌ Nodemailer Error:", error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendOtpToEmail };
