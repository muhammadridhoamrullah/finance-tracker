const { Budget, User, Transaction } = require("../models/index");

async function authorizationBudget(req, res, next) {
  try {
    const UserId = req.user.id;
    const { id } = req.params;

    const findUser = await User.findByPk(UserId);

    if (!findUser) {
      throw { name: "USER_NOT_FOUND" };
    }

    const findBudgetById = await Budget.findOne({
      where: {
        id,
      },
      include: [
        {
          model: User,
          attributes: {
            exclude: ["password"],
          },
        },
        {
          model: Transaction,
        },
      ],
    });

    if (findBudgetById === null) {
      throw { name: "BUDGET_NOT_FOUND" };
    }

    if (findUser.role === "Admin" || UserId === findBudgetById.UserId) {
      next();
    } else {
      console.log("Forbidden access to budget");
      throw { name: "FORBIDDEN" };
    }
  } catch (error) {
    next(error);
  }
}

async function authorizationBudgetForRestore(req, res, next) {
  try {
    const UserId = req.user.id;
    const { id } = req.params;

    const findUser = await User.findByPk(UserId);

    if (!findUser) {
      throw { name: "USER_NOT_FOUND" };
    }

    const findBudgetById = await Budget.findOne({
      where: {
        id,
      },
      include: [
        {
          model: User,
          attributes: {
            exclude: ["password"],
          },
        },
        {
          model: Transaction,
        },
      ],
      paranoid: false,
    });

    if (findBudgetById === null) {
      throw { name: "BUDGET_NOT_FOUND" };
    }

    if (findUser.role === "Admin" || UserId === findBudgetById.UserId) {
      next();
    } else {
      console.log("Forbidden access to budget");
      throw { name: "FORBIDDEN" };
    }
  } catch (error) {
    next(error);
  }
}

module.exports = {
  authorizationBudget,
  authorizationBudgetForRestore,
};
