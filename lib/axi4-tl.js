'use strict';

// ACLK
// ACLKEN
// ARESETn

module.exports = {
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
