'use strict';

const masterAdapterGen = () => p => `IntSourceNode(IntSourcePortSimple(num = ${p.abstractionTypes[0].portMaps.length}))`;

const masterBusParamsGen = () => p => `
case class P${p.name}Params(burstBytes: Int)
`;

const masterNodeGen = () => e => `
val ${e.name}Node: IntSourceNode = imp.${e.name}Node`;

const masterAttachGen = () => e => `bap.ibus := name.${e.name}Node`;

const fixme = () => `
// FIXME`;

module.exports = {
  master: {
    adapter: masterAdapterGen,
    params: masterBusParamsGen,
    node: masterNodeGen,
    attach: masterAttachGen
  },
  slave: {
    adapter: masterAdapterGen,
    params: masterBusParamsGen,
    node: fixme,
    attach: fixme
  },
  busDef: []
};
