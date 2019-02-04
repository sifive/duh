'use strict';

const component = require('./schema-component');

// http://json-schema.org/
module.exports = {
  $schema: 'http://json-schema.org/schema#',
  type: 'object',
  properties: {
    component: component
  }
};
