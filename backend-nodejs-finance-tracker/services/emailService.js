const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const { formatRupiah, formatDate } = require("../helpers/utils");

dotenv.config();

const myEmail = process.env.EMAIL;
const myPassword = process.env.EMAIL_PASSWORD;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: myEmail,
    pass: myPassword,
  },
});

async function sendEmail(to, subject, text) {
  const mailOptions = {
    from: myEmail,
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
    from: myEmail,
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

async function sendBudgetIsLowEmail(user, reportData) {
  const yearNum = new Date().getFullYear(); // 2025
  const mailOptions = {
    from: myEmail,
    to: user.email,
    subject: `⚠️ Your budget is running low`,
    text: `Hai ${user.firstName} ${user.lastName},
    
    Your budget on ${reportData.name} ${yearNum} has only ${formatRupiah(
      reportData.remaining
    )} remaining out of total ${formatRupiah(reportData.amount)}

    We recommend you to reviewing your expenses soon to stay on track with your financial goals. 💡

    Best regards,
    Vibe$ Team
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  sendEmail,
  sendMonthlyReportEmail,
  sendBudgetIsLowEmail,
};
