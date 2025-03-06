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
        console.log("📧 OTP Sent Successfully via Email:", info.messageId);
        return true;
    } catch (error) {
        console.error("❌ Nodemailer Error:", error);
        return false;
    }
};

module.exports = { sendOtpToEmail };
