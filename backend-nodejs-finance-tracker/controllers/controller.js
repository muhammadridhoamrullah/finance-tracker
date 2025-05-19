const { comparePassword } = require("../helpers/bcrypt");
const { SignToken } = require("../helpers/jwt");
const { User, Budget, Transaction } = require("../models/index");

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
        include: [
          {
            model: Transaction,
          },
        ],
      });

      if (budgets === null) {
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
          UserId,
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
          UserId,
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
        },
        {
          where: {
            id,
            UserId,
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
        include: [
          {
            model: Budget,
          },
        ],
      });

      if (myTransaction === null) {
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
          UserId,
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

      res.status(200).json({
        findMyTransactionById,
      });
    } catch (error) {
      next(error);
    }
  }

  // Akhir Transaction
}

module.exports = {
  Controller,
};
