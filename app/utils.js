const bcrypt = require('bcrypt');
const saltRounds = parseInt(process.env.PASSWORD_SALT_ROUNDS, 10) || 5;

const isPasswordValid = function isPasswordValid(password) {
  return password.length > 2 && password.length < 255;
}
const isUsernameValid = function isUsernameValid(username) {
  return username.length > 2 && username.length < 255;
}
const hashPassword = function hashPassword(password) {
  const saltRounds = parseInt(process.env.PASSWORD_SALT_ROUNDS, 10) || 5;
  return bcrypt.hashSync(password, saltRounds);
}
const verifyPassword = function verifyPassword(newPassword, prevPassword) {
  return bcrypt.compareSync(newPassword, prevPassword);
}

module.exports = {
  isPasswordValid,
  isUsernameValid,
  hashPassword,
  verifyPassword
};
