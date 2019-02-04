'use strict';

const vectorDim = require('./vector-dim.js');

const dir = p =>
  p === 'in' ? 'input       ' : p === 'out' ? 'output logic' : p;

const perPort = e =>
  `  ${dir(e.wire.direction)} ${vectorDim(e.wire.width)}${e.name}`;

module.exports = p => {
  const comp = p.component;
  return `// See LICENSE for license details.
module ${comp.name} #() (
${comp.model.ports.map(perPort).join(',\n')}
);

endmodule
`;
};
