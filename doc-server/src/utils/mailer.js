const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // e.g., "smtp.gmail.com"
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // your email password or app password
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
