const e = require("express");
const { comparePassword } = require("../helpers/bcrypt");
const {
  SignToken,
  generateEmailToken,
  verifyEmailToken,
} = require("../helpers/jwt");
const { User, Budget, Transaction } = require("../models/index");
const { or, Op, ExclusionConstraintError } = require("sequelize");
const { redis } = require("../config/redis");
const { sendEmail, sendBudgetIsLowEmail } = require("../services/emailService");
const { formatRupiah, formatDate } = require("../helpers/utils");

class Controller {
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw { name: "EMAIL_PASSWORD_REQUIRED" };
      }

      const findUser = await User.findOne({
        where: {
          email,
        },
      });

      if (!findUser) {
        throw { name: "EMAIL_PASSWORD_INVALID" };
      }

      if (!findUser.isVerified) {
        throw { name: "USER_NOT_VERIFIED" };
      }

      const checkPassword = comparePassword(password, findUser.password);

      if (!checkPassword) {
        throw { name: "EMAIL_PASSWORD_INVALID" };
      }

      const access_token = SignToken({
        id: findUser.id,
        email: findUser.email,
      });

      res.status(200).json({
        access_token,
      });
    } catch (error) {
      next(error);
    }
  }

  static async register(req, res, next) {
    try {
      const { firstName, lastName, email, password, phoneNumber, address } =
        req.body;

      if (
        !firstName ||
        !lastName ||
        !email ||
        !password ||
        !phoneNumber ||
        !address
      ) {
        throw { name: "REGISTER_FIELDS_REQUIRED" };
      }

      const newUser = await User.create({
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
        address,
      });

      const token = generateEmailToken({
        id: newUser.id,
      });

      const link = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

      await sendEmail(
        newUser.email,
        "Verify Your Email",
        `Hi ${newUser.firstName},\n\nPlease verify your email by clicking the link below:\n${link}\n\nThank you!`
      );

      // Hapus cache Redis jika ada
      await redis.del("users:all");
      await redis.del(`user:${newUser.id}`);

      res.status(201).json({
        message:
          "User created successfully, Please check your email to verify your account.",
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmail(req, res, next) {
    try {
      const { token } = req.query;

      const payload = verifyEmailToken(token);

      const user = await User.findByPk(payload.id);

      if (!user) {
        throw { name: "USER_NOT_FOUND" };
      }

      if (user.isVerified) {
        throw { name: "USER_ALREADY_VERIFIED" };
      }

      await user.update({
        isVerified: true,
      });

      res.status(200).json({
        message: "Email verified successfully. You can now log in.",
      });
    } catch (error) {
      next(error);
    }
  }

  // Awal Budget

  static async createBudget(req, res, next) {
    try {
      const { name, amount, startDate, endDate } = req.body;

      const UserId = req.user.id;

      if (!name || !amount || !startDate || !endDate) {
        throw { name: "BUDGET_FIELDS_REQUIRED" };
      }

      if (new Date(endDate) < new Date(startDate)) {
        throw { name: "BUDGET_DATES_INVALID" };
      }

      const newBudget = await Budget.create({
        name,
        amount,
        startDate,
        endDate,
        UserId,
        remaining: amount,
      });

      // Hapus cache Redis jika ada
      await redis.del("budgets:all");
      await redis.del("budgets:admin:all");

      res.status(201).json({
        message: "Budget Created Successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyBudget(req, res, next) {
    try {
      const UserId = req.user.id;
      const getMyBudgetFromRedis = await redis.get("budgets:all");
      console.log(getMyBudgetFromRedis, "<<< getMyBudgetFromRedis <<<");

      if (getMyBudgetFromRedis) {
        const budgets = JSON.parse(getMyBudgetFromRedis);
        return res.status(200).json({
          budgets,
        });
      }

      const budgets = await Budget.findAll({
        where: {
          UserId,
        },
        order: [["createdAt", "ASC"]],
        include: [
          {
            model: Transaction,
            order: [["createdAt", "ASC"]],
          },
          {
            model: User,
            attributes: {
              exclude: ["password"],
            },
          },
        ],
      });

      if (budgets.length === 0) {
        throw { name: "BUDGET_NOT_FOUND" };
      }

      // Simpan ke Redis
      await redis.set("budgets:all", JSON.stringify(budgets));

      res.status(200).json({
        budgets,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyBudgetById(req, res, next) {
    try {
      const { id } = req.params;

      const getMyBudgetByIdFromRedis = await redis.get(`budget:${id}`);
      console.log(getMyBudgetByIdFromRedis, "<<< getMyBudgetByIdFromRedis <<<");

      if (getMyBudgetByIdFromRedis) {
        const budget = JSON.parse(getMyBudgetByIdFromRedis);
        return res.status(200).json({
          findBudgetById: budget,
        });
      }

      const findBudgetById = await Budget.findOne({
        where: {
          id,
        },
        include: [
          {
            model: Transaction,
            order: [["createdAt", "ASC"]],
          },
          {
            model: User,
            attributes: {
              exclude: ["password"],
            },
          },
        ],
      });

      if (findBudgetById === null) {
        throw { name: "BUDGET_NOT_FOUND" };
      }

      // Simpan ke Redis
      await redis.set(`budget:${id}`, JSON.stringify(findBudgetById));

      res.status(200).json({
        findBudgetById,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateMyBudget(req, res, next) {
    try {
      const { id } = req.params;

      const { name, amount, startDate, endDate } = req.body;

      const findBudgetById = await Budget.findOne({
        where: {
          id,
        },
        include: [
          {
            model: Transaction,
          },
        ],
      });

      if (findBudgetById.Transactions.length > 0) {
        throw { name: "BUDGET_CANT_BE_UPDATED" };
      }

      if (findBudgetById === null) {
        throw { name: "BUDGET_NOT_FOUND" };
      }

      // Cek jika startDate lebih besar dari endDate
      if (
        new Date(startDate) > new Date(endDate) ||
        new Date(startDate) > new Date(findBudgetById.endDate)
      ) {
        console.log("sini");

        throw { name: "STARTDATE_INVALID" };
      }

      // Cek jika endDate lebih kecil dari startDate
      if (
        new Date(endDate) < new Date(startDate) ||
        new Date(endDate) < new Date(findBudgetById.startDate)
      ) {
        throw { name: "ENDDATE_INVALID" };
      }

      const updateBudget = await Budget.update(
        {
          name,
          amount,
          startDate,
          endDate,
          remaining: amount,
          updatedAt: new Date(),
        },
        {
          where: {
            id,
          },
        }
      );

      if (updateBudget[0] === 0) {
        throw { name: "ERROR_UPDATE_BUDGET" };
      }

      // Hapus cache Redis jika ada
      await redis.del("budgets:all");
      await redis.del(`budget:${id}`);
      await redis.del("budgets:admin:all");
      await redis.del("transactions:all");
      await redis.del("transactions:admin:all");

      // Jika ada transaksi didalam budget
      if (findBudgetById.Transactions.length > 0) {
        const transactionId = findBudgetById.Transactions.map((el) => el.id);
        console.log(transactionId, "<<< transactionId <<<");

        const deletePromises = transactionId.map((id) =>
          redis.del(`transaction:${id}`)
        );
        await Promise.all(deletePromises);
      }

      res.status(200).json({
        message: "Budget Updated Successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteMyBudget(req, res, next) {
    try {
      const { id } = req.params;

      const findBudgetById = await Budget.findOne({
        where: {
          id,
        },
        include: [
          {
            model: Transaction,
          },
        ],
      });

      if (findBudgetById === null) {
        throw { name: "BUDGET_NOT_FOUND" };
      }
      console.log(findBudgetById, "<<< findBudgetById <<<");

      const isBudgetHasTransactions = findBudgetById.Transactions.length > 0;

      const deleteBudget = await Budget.destroy({
        where: {
          id,
        },
      });

      if (deleteBudget === 0) {
        throw { name: "ERROR_DELETE_BUDGET" };
      }

      // Jika budget memiliki transaksi, hapus transaksi tersebut
      if (findBudgetById.Transactions.length > 0) {
        await Transaction.destroy({
          where: {
            BudgetId: id,
          },
        });
      }

      // Hapus cache Redis jika ada
      await redis.del("budgets:all");
      await redis.del(`budget:${id}`);
      await redis.del("budgets:admin:all");
      await redis.del("transactions:all");

      if (findBudgetById.Transactions.length > 0) {
        const transactionId = findBudgetById.Transactions.map((el) => el.id);
        console.log(transactionId, "<<< transactionId <<<");

        const deletePromises = transactionId.map((id) =>
          redis.del(`transaction:${id}`)
        );
        await Promise.all(deletePromises);
      }

      res.status(200).json({
        message: "Budget Deleted Successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async restoreMyBudget(req, res, next) {
    try {
      const { id } = req.params;

      const findBudgetById = await Budget.findOne({
        where: {
          id,
        },
        paranoid: false,
        include: [
          {
            model: Transaction,
            paranoid: false,
          },
          {
            model: User,
            attributes: {
              exclude: ["password"],
            },
          },
        ],
      });

      if (findBudgetById === null) {
        throw { name: "BUDGET_NOT_FOUND" };
      }

      if (findBudgetById.deletedAt === null) {
        throw { name: "CANT_DOUBLE_RESTORED_BUDGET" };
      }

      const waktuDelete = new Date(findBudgetById.deletedAt);

      await Budget.restore({
        where: {
          id,
        },
      });

      await Transaction.restore({
        where: {
          BudgetId: id,
          deletedAt: {
            [Op.between]: [
              new Date(waktuDelete.getTime() - 1000),
              new Date(waktuDelete.getTime() + 1000),
            ],
          },
        },
      });

      // Hapus cache Redis jika ada
      await redis.del("budgets:all");
      await redis.del(`budget:${id}`);
      await redis.del("budgets:admin:all");
      await redis.del("transactions:all");
      await redis.del("transactions:admin:all");

      // Jika ada transaksi didalam budget
      if (findBudgetById.Transactions.length > 0) {
        const transactionId = findBudgetById.Transactions.map((el) => el.id);
        console.log(transactionId, "<<< transactionId <<<");

        const deletePromises = transactionId.map((id) =>
          redis.del(`transaction:${id}`)
        );
        await Promise.all(deletePromises);
      }

      res.status(200).json({
        message: "Budget Restored Successfully",
        data: findBudgetById,
      });
    } catch (error) {
      next(error);
    }
  }
  // Akhir Budget

  // Awal Transaction

  static async createTransaction(req, res, next) {
    try {
      const { amount, category, type, date, description, BudgetId } = req.body;
      const UserId = req.user.id;

      if (!amount || !category || !type || !date || !BudgetId) {
        throw { name: "TRANSACTION_FIELDS_REQUIRED" };
      }

      const budget = await Budget.findByPk(BudgetId, {
        include: [
          {
            model: User,
            attributes: {
              exclude: ["password"],
            },
          },
        ],
      });

      if (!budget) {
        throw { name: "BUDGET_NOT_FOUND" };
      }

      const isBeforeStartDate = new Date(date) < new Date(budget.startDate);
      const isAfterEndDate = new Date(date) > new Date(budget.endDate);

      if (isBeforeStartDate || isAfterEndDate) {
        throw { name: "TRANSACTION_DATE_INVALID" };
      }

      if (amount > budget.remaining) {
        throw { name: "BUDGET_NOT_ENOUGH" };
      }

      const newTransaction = await Transaction.create({
        amount,
        category,
        type,
        date,
        description,
        BudgetId,
        UserId,
      });

      if (type === "income") {
        await budget.update({
          remaining: Number(budget.remaining) + Number(amount),
          income: Number(budget.income) + Number(amount),
        });
      } else if (type === "expense") {
        await budget.update({
          remaining: Number(budget.remaining) - Number(amount),
          spent: Number(budget.spent) + Number(amount),
        });
        const percentage = Number(budget.remaining) / Number(budget.amount);
        if (Number(amount) >= 1000000) {
          await sendEmail(
            budget.User.email,
            "Large Expense Alert",
            `Hi ${
              budget.User.firstName
            },\n\nYou have recorded a large expense of ${formatRupiah(
              amount
            )} on ${formatDate(date)}. Please review your budget.\n\nThank you!`
          );
        } else if (percentage < 0.2) {
          await sendBudgetIsLowEmail(budget.User, budget);
        }
      }

      // Hapus cache Redis jika ada
      await redis.del("transactions:all");
      await redis.del("transactions:admin:all");
      await redis.del("budgets:all");
      await redis.del(`budget:${BudgetId}`);
      await redis.del("budgets:admin:all");

      res.status(201).json({
        message: "Transaction Created Successfully",
      });
    } catch (error) {
      console.log(error, "<<< error <<<");

      next(error);
    }
  }

  static async getMyTransaction(req, res, next) {
    try {
      const UserId = req.user.id;

      const getMyTransactionFromRedis = await redis.get("transactions:all");
      console.log(
        getMyTransactionFromRedis,
        "<<< getMyTransactionFromRedis <<<"
      );

      if (getMyTransactionFromRedis) {
        const transactions = JSON.parse(getMyTransactionFromRedis);
        return res.status(200).json({
          myTransaction: transactions,
        });
      }

      const myTransaction = await Transaction.findAll({
        where: {
          UserId,
        },
        order: [["createdAt", "ASC"]],
        include: [
          {
            model: Budget,
          },
          {
            model: User,
            attributes: {
              exclude: ["password"],
            },
          },
        ],
      });

      if (myTransaction.length === 0) {
        throw { name: "TRANSACTION_NOT_FOUND" };
      }

      // Simpan ke Redis
      await redis.set("transactions:all", JSON.stringify(myTransaction));

      res.status(200).json({
        myTransaction,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyTransactionById(req, res, next) {
    try {
      const { id } = req.params;

      const getMyTransactionByIdFromRedis = await redis.get(
        `transaction:${id}`
      );
      console.log(
        getMyTransactionByIdFromRedis,
        "<<< getMyTransactionByIdFromRedis <<<"
      );

      if (getMyTransactionByIdFromRedis) {
        const transaction = JSON.parse(getMyTransactionByIdFromRedis);

        return res.status(200).json({
          findMyTransactionById: transaction,
        });
      }

      const findMyTransactionById = await Transaction.findOne({
        where: {
          id,
        },
        include: [
          {
            model: Budget,
          },
          {
            model: User,
            attributes: {
              exclude: ["password"],
            },
          },
        ],
      });

      if (findMyTransactionById === null) {
        throw { name: "TRANSACTION_NOT_FOUND" };
      }

      // Simpan ke Redis
      await redis.set(
        `transaction:${id}`,
        JSON.stringify(findMyTransactionById)
      );

      res.status(200).json({
        findMyTransactionById,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateMyTransaction(req, res, next) {
    try {
      const { id } = req.params;

      const { amount, category, type, date, description } = req.body;

      const findMyTransactionById = await Transaction.findOne({
        where: {
          id,
        },
        include: [
          {
            model: Budget,
          },
          {
            model: User,
            attributes: {
              exclude: ["password"],
            },
          },
        ],
      });

      // Cek jika transaction tidak ditemukan
      if (findMyTransactionById === null) {
        throw { name: "TRANSACTION_NOT_FOUND" };
      }

      // Cek jika tanggal yang diinput lebih kecil dari pada tanggal Start Date Budget
      if (new Date(date) < new Date(findMyTransactionById.Budget.startDate)) {
        throw { name: "UPDATE_DATE_TRANSACTION_LESSER" };
      }

      // Cek jika tanggal yang diinput lebih besar dari pada tanggal End Date Budget
      if (new Date(date) > new Date(findMyTransactionById.Budget.endDate)) {
        throw { name: "UPDATE_DATE_TRANSACTION_GREATER" };
      }

      // Cek jika transaksi type expense
      const isExpense = findMyTransactionById.type === "expense";
      const transaksiLamaDitambahRemaining =
        Number(findMyTransactionById.amount) +
        Number(findMyTransactionById.Budget.remaining);

      if (isExpense) {
        if (Number(amount) > transaksiLamaDitambahRemaining) {
          throw { name: "BUDGET_NOT_ENOUGH" };
        }
      }

      // Update Transaction
      const updateTransaction = await Transaction.update(
        {
          amount,
          category,
          type,
          date,
          description,
          updatedAt: new Date(),
        },
        {
          where: {
            id,
          },
        }
      );

      // Cek jika ada gagal

      if (updateTransaction[0] === 0) {
        throw { name: "ERROR_UPDATE_TRANSACTION" };
      }

      // Update Budget
      const budget = await Budget.findByPk(findMyTransactionById.BudgetId);
      // console.log(budget, "<<< budget <<<");

      // Cek jika budget tidak ditemukan
      if (budget === null) {
        throw { name: "BUDGET_NOT_FOUND" };
      }

      // Expense
      const remainingExpense =
        Number(budget.remaining) + Number(findMyTransactionById.amount);
      const spentExpense =
        Number(budget.spent) - Number(findMyTransactionById.amount);

      // Income
      const remainingIncome =
        Number(budget.remaining) - Number(findMyTransactionById.amount);
      const incomeIncome =
        Number(budget.income) - Number(findMyTransactionById.amount);

      // Cek type yang diinput
      if (findMyTransactionById.type === "income") {
        await budget.update({
          remaining: Number(remainingIncome) + Number(amount),
          income: Number(incomeIncome) + Number(amount),
        });
      } else if (findMyTransactionById.type === "expense") {
        await budget.update({
          remaining: Number(remainingExpense) - Number(amount),
          spent: Number(spentExpense) + Number(amount),
        });
      }

      // Hapus cache Redis jika ada
      await redis.del("transactions:all");
      await redis.del(`transaction:${id}`);
      await redis.del("budgets:all");
      await redis.del(`budget:${findMyTransactionById.BudgetId}`);
      await redis.del("budgets:admin:all");
      await redis.del("transactions:admin:all");

      res.status(200).json({
        message: "Transaction Updated Successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteMyTransaction(req, res, next) {
    try {
      const { id } = req.params;

      const findMyTransactionById = await Transaction.findOne({
        where: {
          id,
        },
        include: [
          {
            model: Budget,
          },
        ],
      });

      if (findMyTransactionById === null) {
        throw { name: "TRANSACTION_NOT_FOUND" };
      }

      const deleteTransaction = await Transaction.destroy({
        where: {
          id,
        },
      });

      if (deleteTransaction === 0) {
        throw { name: "ERROR_DELETE_TRANSACTION" };
      }

      const budget = await Budget.findByPk(findMyTransactionById.BudgetId);
      console.log(budget, "ini budget setelah delete");

      if (budget === null) {
        throw { name: "BUDGET_NOT_FOUND" };
      }

      // Cek jika type yang diinput adalah income
      if (findMyTransactionById.type === "income") {
        await budget.update({
          remaining:
            Number(budget.remaining) - Number(findMyTransactionById.amount),
          income: Number(budget.income) - Number(findMyTransactionById.amount),
        });
      } else if (findMyTransactionById.type === "expense") {
        await budget.update({
          remaining:
            Number(budget.remaining) + Number(findMyTransactionById.amount),
          spent: Number(budget.spent) - Number(findMyTransactionById.amount),
        });
      }

      // Hapus cache Redis jika ada
      await redis.del("transactions:all");
      await redis.del(`transaction:${id}`);
      await redis.del("budgets:all");
      await redis.del(`budget:${findMyTransactionById.BudgetId}`);
      await redis.del("budgets:admin:all");
      await redis.del("transactions:admin:all");

      res.status(200).json({
        message: "Transaction Deleted Successfully",
        data: budget,
      });
    } catch (error) {
      next(error);
    }
  }

  static async restoreMyTransaction(req, res, next) {
    try {
      const { id } = req.params;

      const findMyTransactionById = await Transaction.findOne({
        where: {
          id,
        },
        paranoid: false,
        include: [
          {
            model: Budget,
          },
          {
            model: User,
            attributes: {
              exclude: ["password"],
            },
          },
        ],
      });
      console.log(findMyTransactionById, "<<< findMyTransactionById <<<");

      if (findMyTransactionById === null) {
        throw { name: "TRANSACTION_NOT_FOUND" };
      }

      if (findMyTransactionById.deletedAt === null) {
        throw { name: "CANT_DOUBLE_RESTORED_TRANSACTION" };
      }

      await Transaction.restore({
        where: {
          id,
        },
      });

      const budget = await Budget.findOne({
        where: {
          id: findMyTransactionById.BudgetId,
        },
      });

      if (budget === null) {
        throw { name: "BUDGET_NOT_FOUND" };
      }

      // Cek apa type yang diinput
      if (findMyTransactionById.type === "expense") {
        await budget.update({
          remaining:
            Number(budget.remaining) - Number(findMyTransactionById.amount),
          spent: Number(budget.spent) + Number(findMyTransactionById.amount),
        });
      } else if (findMyTransactionById.type === "income") {
        await budget.update({
          remaining:
            Number(budget.remaining) + Number(findMyTransactionById.amount),
          income: Number(budget.income) + Number(findMyTransactionById.amount),
        });
      }

      // Hapus cache Redis jika ada
      await redis.del("transactions:all");
      await redis.del(`transaction:${id}`);
      await redis.del("budgets:all");
      await redis.del(`budget:${findMyTransactionById.BudgetId}`);
      await redis.del("budgets:admin:all");
      await redis.del("transactions:admin:all");

      res.status(200).json({
        message: "Transaction Restored Successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Akhir Transaction

  // Awal Admin

  static async getAllBudget(req, res, next) {
    try {
      const getAllBudgetByAdminFromRedis = await redis.get("budgets:admin:all");
      console.log(
        getAllBudgetByAdminFromRedis,
        "<<< getAllBudgetByAdminFromRedis <<<"
      );

      if (getAllBudgetByAdminFromRedis) {
        const budgets = JSON.parse(getAllBudgetByAdminFromRedis);

        return res.status(200).json({
          budgets,
        });
      }

      const findAllBudget = await Budget.findAll({
        include: [
          {
            model: User,
            attributes: {
              exclude: ["password"],
            },
            paranoid: false,
          },
          {
            model: Transaction,
            paranoid: false,
          },
        ],
        order: [["createdAt", "ASC"]],
        paranoid: false,
      });

      if (findAllBudget.length === 0) {
        throw { name: "BUDGET_NOT_FOUND" };
      }

      // Simpan ke Redis
      await redis.set("budgets:admin:all", JSON.stringify(findAllBudget));

      res.status(200).json({
        budgets: findAllBudget,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllTransaction(req, res, next) {
    try {
      const getAllTransactionByAdminFromRedis = await redis.get(
        "transactions:admin:all"
      );
      console.log(
        getAllTransactionByAdminFromRedis,
        "<<< getAllTransactionByAdminFromRedis <<<"
      );

      if (getAllTransactionByAdminFromRedis) {
        const transactions = JSON.parse(getAllTransactionByAdminFromRedis);

        return res.status(200).json({
          transactions,
        });
      }

      const findAllTransaction = await Transaction.findAll({
        include: [
          {
            model: Budget,
            paranoid: false,
          },
          {
            model: User,
            attributes: {
              exclude: ["password"],
            },
            paranoid: false,
          },
        ],
        order: [["createdAt", "ASC"]],
        paranoid: false,
      });

      if (findAllTransaction.length === 0) {
        throw { name: "TRANSACTION_NOT_FOUND" };
      }

      // Simpan ke Redis
      await redis.set(
        "transactions:admin:all",
        JSON.stringify(findAllTransaction)
      );

      res.status(200).json({
        transactions: findAllTransaction,
      });
    } catch (error) {
      next(error);
    }
  }

  // Akhir Admin

  // Awal Summary

  static async getSummary(req, res, next) {
    try {
      const UserId = req.user.id;

      // const getSummaryFromRedis = await redis.get(`summary:${UserId}`);
      // console.log(getSummaryFromRedis, "<<< getSummaryFromRedis <<<");

      // if (getSummaryFromRedis) {
      //   const summary = JSON.parse(getSummaryFromRedis);
      //   return res.status(200).json({
      //     summary,
      //   });
      // }

      const budgets = await Budget.findAll({
        where: {
          UserId,
        },
        include: [
          {
            model: Transaction,
            order: [["createdAt", "ASC"]],
          },
        ],
      });

      let earlierStartDate = budgets[0]?.startDate;
      let latestEndDate = budgets[0]?.endDate;

      for (const budget of budgets) {
        if (budget.startDate < earlierStartDate) {
          earlierStartDate = budget.startDate;
        } else if (budget.endDate > latestEndDate) {
          latestEndDate = budget.endDate;
        }
      }

      if (budgets.length === 0) {
        throw { name: "BUDGET_NOT_FOUND" };
      }

      const totalSummary = budgets.reduce(
        (acc, budget) => {
          acc.totalBudget += budget.amount;
          acc.remainingBudget += budget.remaining;
          acc.spentBudget += budget.spent;
          acc.incomeBudget += budget.income;
          return acc;
        },
        {
          totalBudget: 0,
          remainingBudget: 0,
          spentBudget: 0,
          incomeBudget: 0,
        }
      );

      // Simpan ke Redis
      // await redis.set(`summary:${UserId}`, JSON.stringify(summary));

      res.status(200).json({
        summary: {
          ...totalSummary,
          startDate: earlierStartDate,
          endDate: latestEndDate,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSummaryByRange(req, res, next) {
    try {
      const UserId = req.user.id;

      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw { name: "START_END_DATE_REQUIRED" };
      }

      const start = new Date(startDate);
      console.log(start, "<<< start <<<");

      const end = new Date(endDate);
      console.log(end, "<<< end <<<");

      if (start > end) {
        throw { name: "START_END_DATE_INVALID" };
      }

      const budgets = await Budget.findAll({
        where: {
          UserId,
        },
        include: [
          {
            model: Transaction,
            where: {
              date: {
                [Op.between]: [start, end],
              },
            },
          },
        ],
      });

      if (budgets.length === 0) {
        throw { name: "BUDGET_NOT_FOUND" };
      }

      const totalSummaryByRange = budgets.reduce(
        (acc, budget) => {
          acc.totalBudget += budget.amount;
          acc.remainingBudget += budget.remaining;
          acc.spentBudget += budget.spent;
          acc.incomeBudget += budget.income;
          return acc;
        },
        {
          totalBudget: 0,
          remainingBudget: 0,
          spentBudget: 0,
          incomeBudget: 0,
        }
      );

      return res.status(200).json({
        summary: {
          ...totalSummaryByRange,
          startDate: startDate,
          endDate: endDate,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSummaryByMonth(req, res, next) {
    try {
      const UserId = req.user.id;

      const { month, year } = req.query;

      if (!month || !year) {
        throw { name: "MONTH_YEAR_REQUIRED" };
      }

      const start = new Date(year, month - 1, 1);
      console.log(start, "<<< start <<<");

      const end = new Date(year, month, 0);
      end.setHours(23, 59, 59, 999); // Set waktu akhir hari terakhir bulan

      console.log(end, "<<< end <<<");

      // Cek apakah bulan dan tahun valid
      if (month < 1 || month > 12 || year < 1970) {
        throw { name: "MONTH_YEAR_INVALID" };
      }

      const budgets = await Budget.findAll({
        where: {
          UserId,
          [Op.or]: [
            {
              startDate: {
                [Op.between]: [start, end],
              },
            },
            {
              endDate: {
                [Op.between]: [start, end],
              },
            },
          ],
        },
        include: [
          {
            model: Transaction,
          },
        ],
      });

      if (budgets.length === 0) {
        throw { name: "BUDGET_NOT_FOUND" };
      }

      const totalSummaryByMonth = budgets.reduce(
        (acc, budget) => {
          acc.totalBudget += budget.amount;
          acc.remainingBudget += budget.remaining;
          acc.spentBudget += budget.spent;
          acc.incomeBudget += budget.income;
          return acc;
        },
        {
          totalBudget: 0,
          remainingBudget: 0,
          spentBudget: 0,
          incomeBudget: 0,
        }
      );

      res.status(200).json({
        summary: {
          ...totalSummaryByMonth,
          month: parseInt(month),
          year: parseInt(year),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSummaryThisMonth(req, res, next) {
    try {
      const UserId = req.user.id;

      const today = new Date();

      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999); // Set waktu akhir hari terakhir bulan

      const budgets = await Budget.findOne({
        where: {
          UserId,
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
            separate: true,
            order: [["date", "ASC"]],
          },
        ],
      });

      if (!budgets) {
        throw { name: "BUDGET_NOT_FOUND" };
      }

      res.status(200).json({
        summary: {
          budgets,
          month: today.getMonth() + 1, // Bulan dimulai dari 0
          year: today.getFullYear(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSummaryOneMonthAgo(req, res, next) {
    try {
      const UserId = req.user.id;

      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      end.setHours(23, 59, 59, 999); // Set waktu akhir hari terakhir bulan

      const budgets = await Budget.findOne({
        where: {
          UserId,
          startDate: {
            [Op.gte]: start,
          },
          endDate: {
            [Op.lte]: end,
          },
        },
      });

      if (!budgets) {
        throw { name: "BUDGET_NOT_FOUND" };
      }

      res.status(200).json({
        summary: {
          totalBudget: budgets.amount,
          remainingBudget: budgets.remaining,
          spentBudget: budgets.spent,
          incomeBudget: budgets.income,
          month: start.getMonth() + 1, // Bulan dimulai dari 0
          year: start.getFullYear(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSummaryByYear(req, res, next) {
    try {
      const UserId = req.user.id;

      const { year } = req.query;

      if (!year) {
        throw { name: "YEAR_REQUIRED" };
      }

      const start = new Date(year, 0, 1);
      console.log(start, "<<< start <<<");

      const end = new Date(year, 11, 31, 23, 59, 59, 999);
      console.log(end, "<<< end <<<");

      const budgets = await Budget.findAll({
        where: {
          UserId,
          [Op.or]: [
            {
              startDate: {
                [Op.between]: [start, end],
              },
            },
            {
              endDate: {
                [Op.between]: [start, end],
              },
            },
          ],
        },
        include: [
          {
            model: Transaction,
          },
        ],
      });

      if (budgets.length === 0) {
        throw { name: "BUDGET_NOT_FOUND" };
      }

      const totalSummaryByYear = budgets.reduce(
        (acc, budget) => {
          acc.totalBudget += budget.amount;
          acc.remainingBudget += budget.remaining;
          acc.spentBudget += budget.spent;
          acc.incomeBudget += budget.income;
          return acc;
        },
        {
          totalBudget: 0,
          remainingBudget: 0,
          spentBudget: 0,
          incomeBudget: 0,
        }
      );

      res.status(200).json({
        summary: {
          ...totalSummaryByYear,
          year: parseInt(year),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getReportMonthly(req, res, next) {
    try {
      const UserId = req.user.id;
    } catch (error) {
      next(error);
    }
  }

  // Akhir Summary

  // Awal User

  static async getMyProfile(req, res, next) {
    try {
      const UserId = req.user.id;

      const getMyProfileFromRedis = await redis.get(`user:${UserId}`);

      if (getMyProfileFromRedis) {
        const profile = JSON.parse(getMyProfileFromRedis);

        return res.status(200).json({
          profile,
        });
      }

      const getProfile = await User.findByPk(UserId, {
        attributes: {
          exclude: ["password"],
        },
        include: [
          {
            model: Budget,
            order: [["createdAt", "ASC"]],
            include: [
              {
                model: Transaction,
                order: [["createdAt", "ASC"]],
              },
            ],
          },
          {
            model: Transaction,
            order: [["createdAt", "ASC"]],
          },
        ],
      });

      if (!getProfile) {
        throw { name: "USER_NOT_FOUND" };
      }

      // Simpan ke Redis
      await redis.set(`user:${UserId}`, JSON.stringify(getProfile));

      res.status(200).json({
        profile: getProfile,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfileById(req, res, next) {
    try {
      const { id } = req.params;

      const getProfileByIdFromRedis = await redis.get(`user:${id}`);
      console.log(getProfileByIdFromRedis, "<<< getProfileByIdFromRedis <<<");

      if (getProfileByIdFromRedis) {
        const profile = JSON.parse(getProfileByIdFromRedis);

        return res.status(200).json({
          profile,
        });
      }

      const getProfileById = await User.findByPk(id, {
        attributes: {
          exclude: ["password"],
        },
        include: [
          {
            model: Budget,
            order: [["createdAt", "ASC"]],
            include: [
              {
                model: Transaction,
                order: [["createdAt", "ASC"]],
              },
            ],
          },
          {
            model: Transaction,
            order: [["createdAt", "ASC"]],
          },
        ],
      });

      if (!getProfileById) {
        throw { name: "USER_NOT_FOUND" };
      }

      // Simpan ke Redis
      await redis.set(`user:${id}`, JSON.stringify(getProfileById));

      res.status(200).json({
        profile: getProfileById,
      });
    } catch (error) {
      next(error);
    }
  }

  // Akhir User
}

module.exports = {
  Controller,
};
