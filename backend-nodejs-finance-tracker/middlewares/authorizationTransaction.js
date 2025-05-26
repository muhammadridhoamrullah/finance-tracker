const { Budget, Transaction, User } = require("../models/index");
async function authorizationTransaction(req, res, next) {
  try {
    const { id } = req.params;
    const UserId = req.user.id;

    const findUser = await User.findByPk(UserId);
    if (!findUser) {
      throw { name: "USER_NOT_FOUND" };
    }

    const findTransaction = await Transaction.findOne({
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

    if (!findTransaction) {
      throw { name: "TRANSACTION_NOT_FOUND" };
    }

    if (findUser.role === "Admin" || findTransaction.UserId === UserId) {
      next();
    } else {
      throw { name: "FORBIDDEN" };
    }
  } catch (error) {
    next(error);
  }
}

module.exports = {
  authorizationTransaction,
};
