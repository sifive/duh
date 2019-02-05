'use strict';

module.exports = p => (p === 1 ? 'Bool()' : 'UInt(' + p + '.W)');
