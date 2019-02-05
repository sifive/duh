'use strict';

module.exports = p => {
  const comp = p.component;
  const base = `${comp.name.toUpperCase()}_BASE`;
  let i = 0;

  return `// See LICENSE for license details.
#define ${base} 0xA0000000

// targets
${
  comp.busInterfaces
    .filter(e => (e.busType.name === 'channel' && e.interfaceMode === 'slave'))
    .map(e => `#define ${e.name.toUpperCase()} (* (((unsigned long *) ${base} + ${i++}))`)
    .join('\n')
}
// initiators
${
  comp.busInterfaces
    .filter(e => (e.busType.name === 'channel' && e.interfaceMode === 'master'))
    .map(e => `#define ${e.name.toUpperCase()} (* (((unsigned long *) ${base} + ${i++}))`)
    .join('\n')
}
`;
};
