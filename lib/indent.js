'use strict';

module.exports = tab => {
  const prefix = ' '.repeat(tab);
  return str =>
    str
      .split('\n')
      .map(line => prefix + line)
      .join('\n');
};
