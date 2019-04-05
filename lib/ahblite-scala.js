'use strict';

const masterAdapterGen = comp => () => `AHBMasterNode(Seq(
    AHBMasterPortParameters(
      masters = Seq(AHBMasterParameters(
        name = "${comp.name}"
        // nodePath
      )))))
  `;

const slaveAdapterGen = () => () => `AHBSlaveNode(Seq(
    AHBSlavePortParameters(
      slaves = Seq(AHBSlaveParameters(
        address = List(AddressSet(0x0L, 0x40000L-1L)),
        // resources
        // regionType
        executable = false,
        // nodePath
        supportsWrite = TransferSizes(1, 4),
        supportsRead  = TransferSizes(1, 4)
        // device
      )),
      beatBytes = 4
    )))
`;

const masterNodeGen = () => e => `val ${e.name}Node: TLInwardNode = (
  imp.${e.name}Node
    := TLToAHB()
    := TLBuffer()
    // := TLFragmenter()
)
`;

const slaveNodeGen = masterNodeGen;

const masterBusParams = () => e => `
case class P${e.name}Params(burstBytes: Int)
`;

const slaveBusParams = masterBusParams;

const busDef = {
  htrans: 2,
  hburst: 3,
  hwdata: 'wDataWidth',
  hrdata: 'rDataWidth',
  hmastlock: 1,
  hresp: -1,
  haddr: 'addrWidth',
  hwrite: 1,
  hsize: 3,
  hready: -1,
  hreadyout: -1,
  hprot: 4
};

module.exports = {
  master: {
    adapter: masterAdapterGen,
    params: masterBusParams,
    node: masterNodeGen,
    // attach: masterAttachGen,
    // wiring: () => () => ''
  },
  slave: {
    adapter: slaveAdapterGen,
    params: slaveBusParams,
    node: slaveNodeGen,
    // attach: slaveAttachGen,
    // wiring: () => () => ''
  },
  busDef: busDef
};
