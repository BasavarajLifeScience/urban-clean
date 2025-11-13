const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

/**
 * Validate request using express-validator
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    throw new ValidationError(JSON.stringify(errorMessages));
  }

  next();
};

module.exports = validate;
