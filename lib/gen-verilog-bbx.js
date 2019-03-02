'use strict';

const vectorDim = require('./vector-dim.js');

const dir = p =>
  p === 'in' ? 'input       ' : p === 'out' ? 'output logic' : p;

const perPort = e =>
  `  ${dir(e.wire.direction)} ${vectorDim(e.wire.width)}${e.name}`;

const reducePortParameter = (res, e) => {
  const width = e.wire.width;
  if (typeof width === 'string') {
    res[width] = {};
  }
  return res;
};

const reducePSchema = pSchema => (res, e) => {
  if (pSchema[e] !== undefined) {
    res[e] = pSchema[e];
  }
  return res;
};

const collectParametersFromPorts = comp => {
  const pSchema = (comp.pSchema || {}).properties || {};
  const ports = comp.model.ports;
  const hash1 = ports.reduce(reducePortParameter, {});
  const hash2 = Object.keys(pSchema).reduce(reducePSchema(pSchema), hash1);
  return Object.keys(hash2).map(key => {
    const expr = hash2[key].default ? ' = ' + hash2[key].default : '';
    const type = hash2[key].type ? ' /* ' + hash2[key].type + ' */' : '';
    return `  parameter ${key}${expr}${type}`;
  });
};

module.exports = p => {
  const comp = p.component;
  return `// See LICENSE for license details.
module ${comp.name} #(
${collectParametersFromPorts(comp).join(',\n')}
) (
${comp.model.ports.map(perPort).join(',\n')}
);

endmodule
`;
};
