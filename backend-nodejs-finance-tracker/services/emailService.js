const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendEmail(to, subject, text) {
  const mailOptions = {
    from: process.env.EMAIL,
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  sendEmail,
};
