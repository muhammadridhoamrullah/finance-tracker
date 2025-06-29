const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET;

async function signToken(payload) {
  return jwt.sign(payload, SECRET_KEY);
}

async function verifyToken(token) {
  return jwt.verify(token, SECRET_KEY);
}

module.exports = {
  signToken,
  verifyToken,
};
