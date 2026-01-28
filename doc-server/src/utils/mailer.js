const nodemailer = require("nodemailer");
const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_SECURE,
  BASE_URL,
} = require("../config/config");
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: parseInt(EMAIL_PORT) || 587,
  secure: EMAIL_SECURE, // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

const sendOtpEmail = async (to, otp) => {
  const mailOptions = {
    from: `"Gurumaa App" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Gurumaa OTP Code",
    text: `Your OTP code is: ${otp}. It is valid for a few minutes.`,
    html: `<p>Your OTP code is: <b>${otp}</b></p>`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail };
