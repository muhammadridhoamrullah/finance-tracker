const jwt = require("jsonwebtoken");

const SECRET = process.env.SECRETKEY;

const SignToken = (payload) => {
  return jwt.sign(payload, SECRET);
};

const VerifyToken = (token) => {
  return jwt.verify(token, SECRET);
};

module.exports = {
  SignToken,
  VerifyToken,
};
