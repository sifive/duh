'use strict';

// ACLK
// ACLKEN
// ARESETn

/*
    AXI4 to Scala adapter specification
*/

const masterAdapterGen = () => () => {
  const name = 'c.name';
  const maxId = 1 << 'c.mIDBits';
  const isAligned = false;

  return `AXI4MasterNode(
    Seq(
      AXI4MasterPortParameters(
        masters = Seq(
          AXI4MasterParameters(
            name    = ${name},
            id      = IdRange(0, ${maxId}),
            aligned = ${isAligned}
          )
        )
      )
    )
  )
`;
};

const slaveAdapterGen = () => () => {
  const address = 'List(AddressSet(c.control, 0x400L - 1))';
  const maxTransferSize = 4;
  const isExecutable = false;
  const interleavedId = 'Some(0)';
  const beatBytes = 4;

  return `AXI4SlaveNode(
    Seq(
      AXI4SlavePortParameters(
        slaves = Seq(
          AXI4SlaveParameters(
            address       = ${address},
            executable    = ${isExecutable},
            supportsWrite = TransferSizes(1, ${maxTransferSize}),
            supportsRead  = TransferSizes(1, ${maxTransferSize}),
            interleavedId = ${interleavedId}
          )
        ),
        beatBytes = ${beatBytes}
      )
    )
  )
`;
};

const masterBusParams = () => e => `
case class P${e.name}Params(
  burstBytes: Int,
  maxTransactions: Int = 4, // default: from IP-XACT
  axi4BufferParams: AXI4BufferParams = AXI4BufferParams(),
  tlBufferParams: TLBufferParams = TLBufferParams()
)
`;

const slaveBusParams = masterBusParams;

const masterNodeGen = () => e => `
val ${e.name}Node: TLInwardNode =
  (imp.${e.name}Node
    := AXI4Buffer(
      aw = c.${e.name}Params.axi4BufferParams.aw,
      ar = c.${e.name}Params.axi4BufferParams.ar,
      w = c.${e.name}Params.axi4BufferParams.w,
      r = c.${e.name}Params.axi4BufferParams.r,
      b = c.${e.name}Params.axi4BufferParams.b)
    := AXI4UserYanker(capMaxFlight = Some(c.${e.name}Params.maxTransactions))
    := TLToAXI4()
    := TLFragmenter(4, c.${e.name}Params.burstBytes, holdFirstDeny=true)
    := TLBuffer(
      a = c.${e.name}Params.tlBufferParams.a,
      b = c.${e.name}Params.tlBufferParams.b,
      c = c.${e.name}Params.tlBufferParams.c,
      d = c.${e.name}Params.tlBufferParams.d,
      e = c.${e.name}Params.tlBufferParams.e))
`;

const slaveNodeGen = masterNodeGen;

const masterAttachGen = () => e =>
  `bap.pbus.coupleTo("axi") { name.${e.name}Node := TLWidthWidget(bap.pbus) := _ }`;

const slaveAttachGen = masterAttachGen;

const busDef = {
  aw: {
    valid: 1,
    ready: -1,
    bits: {
      id: 'awIdWidth',
      addr: 'awAddrWidth',
      len: 8,
      size: 3,
      burst: 2,
      lock: 1,
      cache: 4,
      prot: 3,
      qos: 4,
      region: 4
    }
  },
  w: {
    valid: 1,
    ready: -1,
    bits: {
      data: 'wDataWidth',
      strb: 'wStrbWidth',
      last: 1
      // user: 'wUserWidth' // not in IP-XACT
    }
  },
  b: {
    valid: -1,
    ready: 1,
    bits: {
      id: '-bIdWidth',
      resp: -2
      // user: '-bUserWidth' // not in IP-XACT
    }
  },
  ar: {
    valid: 1,
    ready: -1,
    bits: {
      id: 'arIdWidth',
      addr: 'addrWidth',
      len: 8,
      size: 3,
      burst: 2,
      lock: 1,
      cache: 4,
      prot: 3,
      qos: 4,
      region: 4
      // user: 'arUserWidth' // not in IP-XACT
    }
  },
  r: {
    valid: -1,
    ready: 1,
    bits: {
      id: '-rIdWidth',
      data: '-dataWidth',
      resp: -2,
      last: -1
      // user: 'rUserWidth' // not in IP-XACT
    }
  }
};

module.exports = {
  master: {
    adapter: masterAdapterGen,
    params: masterBusParams,
    node: masterNodeGen,
    attach: masterAttachGen,
    wiring: () => () => ''
  },
  slave: {
    adapter: slaveAdapterGen,
    params: slaveBusParams,
    node: slaveNodeGen,
    attach: slaveAttachGen,
    wiring: () => () => ''
  },
  busDef: busDef
};
