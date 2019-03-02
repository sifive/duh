'use strict';

const onml = require('onml');
const schema = require('duh-schema');
// const JSON5 = require('json5');

const traverse = (schema, data) => {
  if (schema.type === 'string') return [data];
  if (schema.type === 'number') return [data];
  if (schema.type === 'integer') return [data];
  if (schema.type === 'object') {
    const obj = schema.properties;
    return Object.keys(obj).map(key =>
      [key].concat(traverse(obj[key], data[key]))
    );
  }
  return [];
};

// const rprop = p => key => ['ipxact:' + key, {}, p[key]];
//
// const component = p => ['ipxact:component', {
//     'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
//     'xmlns:ipxact': 'http://www.accellera.org/XMLSchema/IPXACT/2.0',
//     'xsi:schemaLocation': 'http://www.accellera.org/XMLSchema/IPXACT/2.0/index.xsd'
// }]
//     .concat('vendor library name version'.split(' ').map(rprop(p)));

const gen = p => {
  // return JSON5.stringify(component(p.component), null, 2);
  return onml.stringify(
    ['component', {}].concat(traverse(schema.component, p.component)),
    null,
    2
  );
};

module.exports = gen;
