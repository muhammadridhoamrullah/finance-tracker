const bcrypt = require("bcryptjs");

function hashPassword(password) {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);
  return hashedPassword;
}

function comparePassword(password, hashedPassword) {
  const comparing = bcrypt.compareSync(password, hashedPassword);
  return comparing;
}

module.exports = {
  hashPassword,
  comparePassword,
};
