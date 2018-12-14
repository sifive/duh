'use strict';

const masterAdapterGen = p => `IntSourceNode(
    IntSourcePortSimple(
      num = ${p.abstractionTypes[0].portMaps.length}
    )
  )
`;

const masterBusParamsGen = p => `
case class P${p.name}Params()`;

const masterNodeGen = () => `
val irqNode: IntSourceNode = imp.irqNode`;

const masterAttachGen = e => `ibus := name.${e.name}Node`;

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
