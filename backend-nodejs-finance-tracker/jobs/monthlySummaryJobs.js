const cron = require("node-cron");
const { User, Transaction, Budget } = require("../models/index");
const { Op } = require("sequelize");
const { formatDate, formatRupiah } = require("../helpers/utils");
const {
  sendEmail,
  sendMonthlyReportEmail,
} = require("../services/emailService");

cron.schedule("0 16 28-31 * *", async () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const lastDayofMonth = new Date(year, month + 1, 0).getDate();
  console.log(lastDayofMonth, "last day of month");
  console.log(now.getDate(), "current date");

  if (now.getDate() !== lastDayofMonth) return;

  const start = new Date(year, month, 1).toISOString().slice(0, 10); // '2025-06-01'

  const end = new Date(year, month + 1, 0, 23, 59, 59);

  const users = await User.findAll();

  for (const user of users) {
    const budgets = await Budget.findOne({
      where: {
        UserId: user.id,
        startDate: {
          [Op.gte]: start,
        },
        endDate: {
          [Op.lte]: end,
        },
      },
      include: [
        {
          model: Transaction,
        },
      ],
    });

    if (!budgets) continue;

    // Ambil data transaksi untuk bulan ini, jika ada
    let transactionsText = budgets.Transactions.map((el, i) => {
      let date = formatDate(el.date);
      let jumlah = formatRupiah(el.amount);
      let type = el.type === "income" ? "Pemasukan" : "Pengeluaran";

      return `${i + 1}. ${type} | ${el.category} - ${
        el.description
      } sebesar ${jumlah} pada tanggal ${date}`;
    })
      .join("\n")
      .trim();

    // Jika tidak ada transaksi, gunakan pesan default
    if (!transactionsText) {
      transactionsText = "There are no transactions for this month.";
    }

    await sendMonthlyReportEmail(user, budgets, transactionsText);
  }
});
