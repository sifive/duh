'use strict';

const masterAdapterGen = comp => () => `APBMasterNode(Seq(
    APBMasterPortParameters(
      masters = Seq(APBMasterParameters(
        name = "${comp.name}"
        // nodePath
      )))))
  `;

const slaveAdapterGen = () => () => `APBSlaveNode(Seq(
    APBSlavePortParameters(
      slaves = Seq(APBSlaveParameters(
        address = List(AddressSet(0x0L, 0x40000L-1L)),
        // resources
        // regionType
        executable = false,
        // nodePath
        supportsWrite = true,
        supportsRead  = true
        // device
      )),
      beatBytes = 4
    )
  ))
`;

const slaveNodeGen = () => e => `val ${e.name}Node: TLInwardNode = (
  imp.${e.name}Node
    := TLToAPB()
    := TLBuffer()
)
`;

const masterNodeGen = () => e => `val ${e.name}Node: TLOutwardNode = (
  APBToTL()
    := TLBuffer()
    := imp.${e.name}Node
)
`;

const busDef = {
  prdata: 'dataWidth',
  pwrite: 1,
  penable: 1,
  psel: 1,
  pready: -1,
  pslverr: 1,
  paddr: 'addrWidth',
  pwdata: 'dataWidth',
  pprot: 3
};

module.exports = {
  master: {
    adapter: masterAdapterGen,
    // params: masterBusParams,
    node: masterNodeGen,
    // attach: masterAttachGen,
    // wiring: () => () => ''
  },
  slave: {
    adapter: slaveAdapterGen,
    // params: slaveBusParams,
    node: slaveNodeGen,
    // attach: slaveAttachGen,
    // wiring: () => () => ''
  },
  busDef: busDef
};
