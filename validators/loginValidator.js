const {check} = require('express-validator');

const loginValidator = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'password is required').exists()
];

module.exports = loginValidator;