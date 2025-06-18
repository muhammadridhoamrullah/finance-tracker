const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const { formatRupiah, formatDate } = require("../helpers/utils");

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

async function sendMonthlyReportEmail(user, reportData, transactionsText) {
  const start = new Date(reportData.startDate);
  const monthName = start.toLocaleString("en-US", { month: "long" }); //
  const yearNum = start.getFullYear(); // 2025

  const mailOptions = {
    from: process.env.EMAIL,
    to: user.email,
    subject: `Monthly Financial Report for ${monthName} ${yearNum} `,
    text: `Hai ${user.firstName} ${user.lastName},

    Here is your financial report for ${monthName} ${yearNum}:

    - Total Budget: ${formatRupiah(reportData.amount)}
    - Total Income: ${formatRupiah(reportData.income)}
    - Total Spent: ${formatRupiah(reportData.spent)}
    - Remaining Budget: ${formatRupiah(reportData.remaining)}


    Details of your transactions:
    
    ${transactionsText}

    Thank you for using our finance tracker 💪!
    We hope this report helps you in managing your finances better.
    If you have any questions, feel free to contact us.

    Best regards,
    Vibe$ Team
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  sendEmail,
  sendMonthlyReportEmail,
};
