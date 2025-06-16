const jwt = require("jsonwebtoken");

const SECRET = process.env.SECRETKEY;
const EMAIL_SECRET = process.env.EMAIL_SECRET;

const SignToken = (payload) => {
  return jwt.sign(payload, SECRET);
};

const VerifyToken = (token) => {
  return jwt.verify(token, SECRET);
};

const generateEmailToken = (payload) => {
  return jwt.sign(payload, EMAIL_SECRET, { expiresIn: "1h" });
};

const verifyEmailToken = (token) => {
  return jwt.verify(token, EMAIL_SECRET);
};

module.exports = {
  SignToken,
  VerifyToken,
  generateEmailToken,
  verifyEmailToken,
};
