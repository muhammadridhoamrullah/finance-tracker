const { VerifyToken } = require("../helpers/jwt");
const { User } = require("../models/index");

async function authentication(req, res, next) {
  try {
    console.log("Masuk Authentication Middleware");
    const { authorization } = req.headers;

    if (!authorization) {
      throw { name: "UNAUTHORIZED" };
    }
    console.log("Authorization Header:", authorization);
    

    const token = authorization.split(" ")[1];
    console.log("Token:", token);
    

    const payload = VerifyToken(token);
    console.log("Decoded Payload:", payload);
    

    const findUser = await User.findByPk(payload.id);

    if (!findUser) {
      throw { name: "UNAUTHORIZED" };
    }

    req.user = {
      id: findUser.id,
      email: findUser.email,
    };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  authentication,
};
