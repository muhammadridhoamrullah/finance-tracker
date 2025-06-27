const bcrypt = require("bcryptjs");

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

async function comparePassword(password, hashedPassword) {
  const comparing = await bcrypt.compare(password, hashedPassword);
  return comparing;
}

module.exports = {
  hashPassword,
  comparePassword,
};
