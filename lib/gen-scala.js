'use strict';

const axi4Tl = require('./axi4-tl');
const intcTl = require('./intc-tl');
const signValue = require('./sign-value');
const traverseSpec = require('./traverse-spec');
const flipString = require('./flip-string');
const indent = require('./indent');

const adapters = {
    AXI4: axi4Tl,
    interrupts: intcTl
};

const buses = {
    'amba.com': {
        AMBA4: {
            AXI4: axi4Tl.busDef
        }
    },
    'sifive.com': {
        free: {
            interrupts: intcTl.busDef
        }
    }
};

const dir = p => body =>
    (p === 'in' ? 'Input' : p === 'out' ? 'Output' : p) +
    '(' + body + ')';

const type = p => p === 1 ? 'Bool()' : 'UInt(' + p + '.W)';

const perPort = e => {
    const rhs = dir(e.wire.direction)(type(e.wire.width));
    return `  val ${e.name} = ${rhs}`;
};

const perBusInterface = e => {
    const adapter = adapters[e.busType.name] || {};
    const handle = adapter[e.interfaceMode] || (() => 'unknownBusType()');
    return `  val ${e.name} = ${handle(e)}`;
};

const logicalPortMap = portMap => portMap.reduce((prev, cur) => {
    prev[cur.logicalPort.name] = cur;
    return prev;
}, {});

const perBusInterfaceAlias = () =>
    e => `val (${e.name}0, _) = ${e.name}.${e.interfaceMode == 'slave' ? 'in': 'out'}(0)`;

const perBusInterfaceWiring = comp => {

    const portObj = comp.model.ports.reduce((prev, cur) => {
        prev[cur.name] = cur;
        return prev;
    }, {});

    return e => {
        let res = '';
        res += '// ' + e.name + ' ' + e.busType.name + '\n';
        const bus = buses[e.busType.vendor][e.busType.library][e.busType.name];
        const lPortMap = logicalPortMap(e.abstractionTypes[0].portMaps);

        traverseSpec({
            enter: (node, path) => {
                if (Array.isArray(node)) {
                    Object.keys(lPortMap).map((busName, i) => {
                        const rhs = lPortMap[busName].physicalPort.name;
                        if (portObj[rhs].wire.direction === 'out') {
                            res += `${e.name}0(${i}) := blackbox.io.${rhs}\n`;
                            return;
                        }
                        res += `blackbox.io.${rhs} := ${e.name}0(${i})\n`;
                        return;
                    });
                    return;
                }

                if (typeof node === 'object') {
                    res += '// ' + path[0] + '\n';
                    return;
                }

                const busName = flipString(path[0] + path[path.length - 1]);
                const tlName = path.join('.');
                if (lPortMap[busName]) {
                    const rhs = lPortMap[busName].physicalPort.name;
                    if (portObj[rhs].wire.direction === 'out') {
                        res += `${e.name}0.${tlName} := blackbox.io.${rhs}\n`;
                        return;
                    }
                    res += `blackbox.io.${rhs} := ${e.name}0.${tlName}\n`;
                    return;
                }

                const sig = signValue(node);

                if (sig.sign ^ (e.interfaceMode == 'slave')) {
                    res += `${e.name}0.${tlName} := ${(sig.value === 1) ? 'true.B' : '0.U'}\n`;
                    return;
                }
                res += '// ' + busName + '\n';
            }
        })(bus);
        return res;
    };

};

const reducePortParameter = (res, e) => {
    const width = e.wire.width;
    if (typeof width === 'string') {
        res[width] = true;
    }
    return res;
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
${
    Object
        .keys(comp.model.ports.reduce(reducePortParameter, {}))
        .map(p => `  val ${p}: Int`)
        .join(',\n')
}
) extends Bundle {
${comp.model.ports.map(perPort).join('\n')}
}

class ${comp.name}(
${
    Object
        .keys(comp.model.ports.reduce(reducePortParameter, {}))
        .map(p => `  val ${p}: Int`)
        .join(',\n')
}
) extends BlackBox(Map(
${
    Object
        .keys(comp.model.ports.reduce(reducePortParameter, {}))
        .map(p => `  "${p}" -> core.IntParameter(${p})`)
        .join(',\n')
}
)) with HasBlackBoxResource {
  val io = new pioBlackBoxIO(${
    Object
        .keys(comp.model.ports.reduce(reducePortParameter, {}))
        .join(', ')
})
}

case class pioParams(
  control: BigInt,
${
    Object
        .keys(comp.model.ports.reduce(reducePortParameter, {}))
        .map(p => `  ${p}: Int`)
        .join(',\n')
})

class DiplomaticBrick(c: ${comp.name}Params)(implicit p:Parameters) extends LazyModule
{
${comp.busInterfaces.map(perBusInterface).join('\n')}

  lazy val module = new LazyRawModuleImp(this) {

    val blackbox = Module(new ${comp.name}(
${
    Object
        .keys(comp.model.ports.reduce(reducePortParameter, {}))
        .map(p => `      c.${p}`)
        .join(',\n')
}
    ))

${indent(4)(comp.busInterfaces.map(perBusInterfaceAlias(comp)).join('\n'))}

${indent(4)(comp.busInterfaces.map(perBusInterfaceWiring(comp)).join('\n'))}

  }

}
`;
};
