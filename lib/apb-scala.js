'use strict';

const masterAdapterGen = () => () => `APBMasterNode(Seq(
    APBMasterPortParameters(
      masters = Seq(APBMasterParameters(
        name = c.name
        // nodePath
      )))))
  `;

const slaveAdapterGen = () => () => `APBSlaveNode(Seq(
    APBSlavePortParameters(
      slaves = Seq(APBSlaveParameters(
        address = List(AddressSet(params.raddress, 0x40000L-1L)),
        // resources
        // regionType
        executable = false,
        // nodePath
        supportsWrite = true,
        supportsRead  = true
        // device
      )))))
`;

const masterNodeGen = () => e => `val ${e.name}Node: TLInwardNode = (
  imp.${e.name}Node := TLToAPB())
`;

const slaveNodeGen = () => e => `val ${e.name}Node: TLInwardNode = (
  imp.${e.name}Node := TLToAPB())
`;

const busDef = {
  prdata: 'dataWidth',
  pwrite: 1,
  penable: 1,
  pselx: 1,
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
