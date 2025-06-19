import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail(to: string, subject: string, text: string) {
  const mailOptions = {
    from: process.env.EMAIL,
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
}
