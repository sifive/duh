'use strict';

const axi4Tl = require('./axi4-tl');
const dirWidth = require('./dir-width');

const buses = {
    'amba.com': {
        AMBA4: {
            AXI4: axi4Tl
        }
    }
};

const flipString = str => str
    .split('')
    .map(c => (c === c.toUpperCase()) ? c.toLowerCase() : c.toUpperCase())
    .join('');

// const busReverse = spec => {
//
//     const res = {};
//
//     Object.keys(spec).map(cName => {
//         const channel = spec[cName];
//         Object.keys(channel).map(bName => {
//             const bundle = channel[bName];
//             if (
//                 (typeof bundle === 'number') ||
//                 (typeof bundle === 'string')
//             ) {
//                 res[flipString(cName + bName)] = {
//                     tl: [cName, bName].join('.'),
//                     width: bundle
//                 };
//             } else {
//                 Object.keys(bundle).map(lName => {
//                     res[flipString(cName + lName)] = {
//                         tl: [cName, bName, lName].join('.'),
//                         width: bundle[lName]
//                     };
//                 });
//             }
//         });
//     });
//
//     return res;
//
// };


// console.log(logicTl);

const dir = p => body =>
    (p === 'in' ? 'Input' : p === 'out' ? 'Output' : p) +
    '(' + body + ')';

const type = p => p === 1 ? 'Bool()' : 'UInt(' + p + '.W)';

const perPort = e => {
    const rhs = dir(e.wire.direction)(type(e.wire.width));
    return `  val ${e.name} = ${rhs}`;
};

const slaveAXI4 = () => {
    return `AXI4SlaveNode(Seq(AXI4SlavePortParameters(
    slaves = Seq(AXI4SlaveParameters(
      address       = c.bars,
      resources     = Seq(Resource(device, "ranges")),
      executable    = true,
      supportsWrite = TransferSizes(1, 128),
      supportsRead  = TransferSizes(1, 128))),
    beatBytes = c.busBytes)))`;
};

const masterAXI4 = () => {
    return `AXI4MasterNode(Seq(AXI4MasterPortParameters(
    masters = Seq(AXI4MasterParameters(
      name    = c.name,
      id      = IdRange(0, 1 << c.mIDBits),
      aligned = false)))))`;
};

const perBusInterface = e => {
    let rhs = 'unknownBusType()';
    if (e.busType.name === 'AXI4') {
        switch(e.interfaceMode) {
        case 'slave': rhs = slaveAXI4(e); break;
        case 'master': rhs = masterAXI4(e); break;
        }
    }
    return `  val ${e.name} = ${rhs}`;
};

const logicalPortMap = portMap => portMap.reduce((prev, cur) => {
    prev[cur.logicalPort.name] = cur;
    return prev;
}, {});

const busReverse1 = spec => {

    const res = {};

    Object.keys(spec).map(cName => {
        const channel = spec[cName];
        Object.keys(channel).map(bName => {
            const bundle = channel[bName];
            if (
                (typeof bundle === 'number') ||
                (typeof bundle === 'string')
            ) {
                res[flipString(cName + bName)] = {
                    tl: [cName, bName].join('.'),
                    width: bundle
                };
            } else {
                Object.keys(bundle).map(lName => {
                    res[flipString(cName + lName)] = {
                        tl: [cName, bName, lName].join('.'),
                        width: bundle[lName]
                    };
                });
            }
        });
    });

    return res;

};

// const perBusInterfaceWiring1 = comp => {
//
//     const portObj = comp.model.ports.reduce((prev, cur) => {
//         prev[cur.name] = cur;
//         return prev;
//     }, {});
//
//     return e => {
//         return '    // ' + e.name + '\n' +
//         e.abstractionTypes.map(atype => {
//             if (atype.viewRef === 'RTLview') {
//                 return atype.portMaps.map(pm => {
//                     let lhs = e.name + '.' + logicTl.axi4[pm.logicalPort.name].tl;
//                     let rhs = pm.physicalPort.name;
//                     if (portObj[rhs].wire.direction === 'in') {
//                         return `    bbx.${rhs} := ${lhs}`;
//                     }
//                     return `    ${lhs} := bbx.${rhs}`;
//                 }).join('\n');
//             }
//             return '// ' + atype.viewRef;
//         }).join('\n');
//     };
//
// };

const traverseSpec = (spec, cb) => {

    let res = '';

    Object.keys(spec).map(cName => {
        const channel = spec[cName];
        res += '\n    // ' + cName + '\n';
        Object.keys(channel).map(bName => {
            const bundle = channel[bName];
            if ((typeof bundle === 'number') || (typeof bundle === 'string')) {
                res += '    ' + cb(
                    flipString(cName + bName),
                    [cName, bName].join('.'),
                    bundle
                ) + '\n';
            } else {
                Object.keys(bundle).map(lName => {
                    res += '    ' + cb(
                        flipString(cName + lName),
                        [cName, bName, lName].join('.'),
                        bundle[lName]
                    ) + '\n';
                });
            }
        });
    });

    return res;

};


const perBusInterfaceWiring = comp => {

    const portObj = comp.model.ports.reduce((prev, cur) => {
        prev[cur.name] = cur;
        return prev;
    }, {});

    return e => {
        let res = '    ';
        res += '// ' + e.name + ' ' + e.busType.name + '\n';
        const bus = buses[e.busType.vendor][e.busType.library][e.busType.name];
        const lPortMap = logicalPortMap(e.abstractionTypes[0].portMaps);
        res += traverseSpec(bus, (busName, tlName, signal) => {
            if (lPortMap[busName]) {
                const rhs = lPortMap[busName].physicalPort.name;
                if (
                    (portObj[rhs].wire.direction === 'in') ^
                    (e.interfaceMode == 'slave')
                ) {
                    return `${e.name}.${tlName} := blackbox.io.${rhs}`;
                }
                return `blackbox.io.${rhs} := ${e.name}.${tlName}`;
            }
            const sig = dirWidth(signal);
            if (sig.dir ^ (e.interfaceMode == 'slave')) {
                return `${e.name}.${tlName} := ${(sig.width === 1) ? 'true.B' : '0.U'}`;
            }
            return '// ' + busName;
        });
        return res;
    };

};


module.exports = p => {
    const comp = p.component;
    return `// See LICENSE for license details.
package ${comp.vendor}.${comp.library}.${comp.name}

import chisel3._
import chisel3.util._
import freechips.rocketchip.config._
import freechips.rocketchip.diplomacy._
import freechips.rocketchip.amba.axi4._
import freechips.rocketchip.interrupts._
import freechips.rocketchip.util.{ElaborationArtefacts}

class ${comp.name}BlackBoxIO(

) extends Bundle {
${comp.model.ports.map(perPort).join('\n')}
}

class DiplomaticBrick(c: ${comp.name}Params)(implicit p:Parameters) extends LazyModule
{
${comp.busInterfaces.map(perBusInterface).join('\n')}

val intnode = IntSourceNode(IntSourcePortSimple(num = 3, resources = device.int))

  lazy val module = new LazyRawModuleImp(this) {

    val io = IO(new Bundle {
      val pads   = new ${comp.name}Pads(c.lanes)
      val clocks = new ${comp.name}Clocks
    })

    val blackbox = Module(new ${comp.name}BlackBox(c))

    // Pads
    // Clocks
    // I
    // Buses
${comp.busInterfaces.map(perBusInterfaceWiring(comp)).join('\n')}
  }

}
`;
};
