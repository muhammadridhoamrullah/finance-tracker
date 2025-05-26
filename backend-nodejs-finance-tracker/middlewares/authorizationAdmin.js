const { User, Budget, Transaction } = require("../models/index");
async function authorizationAdmin(req, res, next) {
  try {
    const UserId = req.user.id;

    const checkUser = await User.findByPk(UserId);

    if (!checkUser) {
      throw { name: "USER_NOT_FOUND" };
    }

    if (checkUser.role === "Admin") {
      next();
    } else {
      throw { name: "FORBIDDEN" };
    }
  } catch (error) {
    next(error);
  }
}

module.exports = {
  authorizationAdmin,
};
