'use strict';

// ACLK
// ACLKEN
// ARESETn

/*
    AXI4 to Scala adapter specification
*/

exports.master = () => {
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

exports.slave = () => {
    const address = 'List(AddressSet(c.control, 0x3ffffffL))';
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
            resources     = Seq(Resource(device, "ranges")),
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

exports.busDef = {
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
