const e = require("express");
const { comparePassword } = require("../helpers/bcrypt");
const { SignToken } = require("../helpers/jwt");
const { User, Budget, Transaction } = require("../models/index");
const { or } = require("sequelize");

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

      res.status(201).json({
        message: "User created successfully",
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

      const budgets = await Budget.findAll({
        where: {
          UserId,
        },
        order: [["createdAt", "ASC"]],

        include: [
          {
            model: Transaction,
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

      res.status(200).json({
        budgets,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyBudgetById(req, res, next) {
    try {
      const UserId = req.user.id;

      const { id } = req.params;

      const findBudgetById = await Budget.findOne({
        where: {
          id,
        },
        include: [
          {
            model: Transaction,
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

      res.status(200).json({
        findBudgetById,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateMyBudget(req, res, next) {
    try {
      const UserId = req.user.id;

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
      console.log(findBudgetById, "<<< findBudgetById <<<");

      if (findBudgetById.Transactions.length > 0) {
        throw { name: "BUDGET_CANT_BE_UPDATED" };
      }

      if (findBudgetById === null) {
        throw { name: "BUDGET_NOT_FOUND" };
      }

      // Cek jika startDate lebih besar dari endDate
      if (new Date(startDate) > new Date(endDate)) {
        throw { name: "STARTDATE_INVALID" };
      }

      // Cek jika startDate lebih besar dari endDate di data yang sudah ada
      if (new Date(startDate) > new Date(findBudgetById.endDate)) {
        throw { name: "STARTDATE_INVALID" };
      }

      // Cek jika endDate lebih kecil dari startDate
      if (new Date(endDate) < new Date(startDate)) {
        throw { name: "ENDDATE_INVALID" };
      }

      // Cek jika endDate lebih kecil dari startDate di data yang sudah ada
      if (new Date(endDate) < new Date(findBudgetById.startDate)) {
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

      res.status(200).json({
        message: "Budget Updated Successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteMyBudget(req, res, next) {
    try {
      const UserId = req.user.id;

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

      const deleteBudget = await Budget.destroy({
        where: {
          id,
        },
      });

      if (deleteBudget === 0) {
        throw { name: "ERROR_DELETE_BUDGET" };
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
      const UserId = req.user.id;
      const { id } = req.params;

      const findBudgetById = await Budget.findOne({
        where: {
          id,
        },
        paranoid: false,
      });

      if (findBudgetById === null) {
        throw { name: "BUDGET_NOT_FOUND" };
      }

      await Budget.restore();

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

      const budget = await Budget.findByPk(BudgetId);

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
      }

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

      res.status(200).json({
        myTransaction,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyTransactionById(req, res, next) {
    try {
      const UserId = req.user.id;

      const { id } = req.params;

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

      res.status(200).json({
        findMyTransactionById,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateMyTransaction(req, res, next) {
    try {
      const UserId = req.user.id;

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

      // // Cek jika angka yang diinput lebih besar dari pada sisa budget
      // if (amount > findMyTransactionById.Budget.remaining) {
      //   throw { name: "BUDGET_NOT_ENOUGH" };
      // }

      // Cek jika tanggal yang diinput lebih kecil dari pada tanggal Start Date Budget
      if (new Date(date) < new Date(findMyTransactionById.Budget.startDate)) {
        throw { name: "UPDATE_DATE_TRANSACTION_LESSER" };
      }

      // Cek jika tanggal yang diinput lebih besar dari pada tanggal End Date Budget
      if (new Date(date) > new Date(findMyTransactionById.Budget.endDate)) {
        throw { name: "UPDATE_DATE_TRANSACTION_GREATER" };
      }

      // Cek jika transaksi type expense
      if (findMyTransactionById.type === "expense") {
        if (amount > findMyTransactionById.Budget.remaining) {
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

      res.status(200).json({
        message: "Transaction Updated Successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteMyTransaction(req, res, next) {
    try {
      const UserId = req.user.id;

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
      console.log(findMyTransactionById, "ini sebelum delete");

      if (findMyTransactionById === null) {
        throw { name: "TRANSACTION_NOT_FOUND" };
      }

      const deleteTransaction = await Transaction.destroy({
        where: {
          id,
        },
      });
      console.log(deleteTransaction, "ini delete transaction");

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
      const UserId = req.user.id;
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

      res.status(200).json({
        budgets: findAllBudget,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllTransaction(req, res, next) {
    try {
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

      res.status(200).json({
        transactions: findAllTransaction,
      });
    } catch (error) {
      next(error);
    }
  }

  // Akhir Admin
}

module.exports = {
  Controller,
};

// {
//   "budgets": [
//     {
//       "id": 2,
//       "UserId": 4,
//       "name": "January",
//       "amount": 1000000,
//       "spent": 50000,
//       "income": 0,
//       "startDate": "2025-01-01T00:00:00.000Z",
//       "endDate": "2025-01-31T00:00:00.000Z",
//       "remaining": 950000,
//       "createdAt": "2025-05-26T08:23:00.114Z",
//       "updatedAt": "2025-05-26T13:58:51.063Z",
//       "deletedAt": null,
//       "Transactions": [
//         {
//           "id": 2,
//           "amount": 25000,
//           "category": "Food",
//           "type": "expense",
//           "date": "2025-01-03T00:00:00.000Z",
//           "description": "Makan Seafood",
//           "UserId": 4,
//           "BudgetId": 2,
//           "createdAt": "2025-05-26T08:23:55.233Z",
//           "updatedAt": "2025-05-26T08:24:46.681Z",
//           "deletedAt": null
//         },
//         {
//           "id": 6,
//           "amount": 25000,
//           "category": "Drink",
//           "type": "expense",
//           "date": "2025-01-03T00:00:00.000Z",
//           "description": "Minum Es Teh",
//           "UserId": 4,
//           "BudgetId": 2,
//           "createdAt": "2025-05-26T13:58:51.048Z",
//           "updatedAt": "2025-05-26T13:58:51.048Z",
//           "deletedAt": null
//         }
//       ]
//     }
//   ]
// }

// {
//   "budgets": [
//     {
//       "id": 2,
//       "UserId": 4,
//       "name": "January",
//       "amount": 1000000,
//       "spent": 25000,
//       "income": 0,
//       "startDate": "2025-01-01T00:00:00.000Z",
//       "endDate": "2025-01-31T00:00:00.000Z",
//       "remaining": 975000,
//       "createdAt": "2025-05-26T08:23:00.114Z",
//       "updatedAt": "2025-05-26T13:59:51.881Z",
//       "deletedAt": null,
//       "Transactions": [
//         {
//           "id": 2,
//           "amount": 25000,
//           "category": "Food",
//           "type": "expense",
//           "date": "2025-01-03T00:00:00.000Z",
//           "description": "Makan Seafood",
//           "UserId": 4,
//           "BudgetId": 2,
//           "createdAt": "2025-05-26T08:23:55.233Z",
//           "updatedAt": "2025-05-26T08:24:46.681Z",
//           "deletedAt": null
//         }
//       ]
//     }
//   ]
// }
