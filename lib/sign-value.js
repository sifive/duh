'use strict';

/*
  Takes an signed expression and return Sign and Value separately
*/

module.exports = function(expr) {
  if (typeof expr === 'number') {
    return expr < 0
      ? { value: -expr, sign: false }
      : { value: expr, sign: true };
  }
  if (typeof expr === 'string') {
    return expr.slice(0, 1) === '-'
      ? { value: expr.slice(1), sign: false }
      : { value: expr, sign: true };
  }
  throw new Error(typeof expr);
};
