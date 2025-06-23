const cron = require("node-cron");
const { User, Budget, Transaction } = require("../models/index");
const { Op } = require("sequelize");
const { sendBudgetIsLowEmail } = require("../services/emailService");

cron.schedule("0 8 * * *", async () => {
  const users = await User.findAll();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const start = new Date(year, month, 1).toISOString().slice(0, 10);

  const end = new Date(year, month + 1, 0, 23, 59, 59);

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

    const percentage = budgets.remaining / budgets.amount;

    if (percentage < 0.2) {
      await sendBudgetIsLowEmail(user, budgets);
    }
  }
});
