'use strict';

const axi4Tl = require('./axi4-tl');
const intcTl = require('./intc-tl');
const signValue = require('./sign-value');
const traverseSpec = require('./traverse-spec');
const flipString = require('./flip-string');
const indent = require('./indent');

const generators = {
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
    const generator = generators[e.busType.name] || {};
    const handle = generator[e.interfaceMode].adapter || (() => 'unknownBusType()');
    return `  val ${e.name}Node = ${handle(e)}`;
};

const logicalPortMap = portMap => portMap.reduce((prev, cur) => {
    prev[cur.logicalPort.name] = cur;
    return prev;
}, {});

const perBusInterfaceAlias = () =>
    e => `val (${e.name}0, _) = ${e.name}Node.${e.interfaceMode == 'slave' ? 'in': 'out'}(0)`;

const perBusInterfaceParams = () => e => {
    const generator = generators[e.busType.name] || {};
    const handle = generator[e.interfaceMode].params || (() => 'unknownBusType()');
    return handle(e);
};

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
import freechips.rocketchip.tilelink._
import sifive.skeleton._
import freechips.rocketchip.subsystem._

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
        .map(p => `  "${p}" -> core.IntParam(${p})`)
        .join(',\n')
}
)) with HasBlackBoxResource {
  val io = IO(new pioBlackBoxIO(${
    Object
        .keys(comp.model.ports.reduce(reducePortParameter, {}))
        .join(', ')
}))
  setResource("/pio.v")
}

case class ${comp.name}Params(
  control: BigInt,
${
    Object
        .keys(comp.model.ports.reduce(reducePortParameter, {}))
        .map(p => `  ${p}: Int = 64`)
        .join(',\n')
})

// abstract class NameBrickBase
// stub: class NameBrick extends Base { ...
//class NameBrick extends DiplomaticBrick {
//  InModuleBody {
//    module.blackbox.io.clk := module.clock
//    module.blackbox.io.reset_n := !module.reset
//  }
//}

class DiplomaticBrick(c: ${comp.name}Params)(implicit p:Parameters) extends LazyModule
{
${comp.busInterfaces.map(perBusInterface).join('\n')}

  // lazy val module = new LazyRawModuleImp(this) {
    lazy val module = new LazyModuleImp(this) {

    val blackbox = Module(new ${comp.name}(
${
    Object
        .keys(comp.model.ports.reduce(reducePortParameter, {}))
        .map(p => `      c.${p}`)
        .join(',\n')
}
    ))
    blackbox.io.clk := clock.asUInt
    blackbox.io.reset_n := !(reset.toBool)

${indent(4)(comp.busInterfaces.map(perBusInterfaceAlias(comp)).join('\n'))}

${indent(4)(comp.busInterfaces.map(perBusInterfaceWiring(comp)).join('\n'))}

  }

}

// TODO move to diplomacy
trait DirectedBuffers[T] {
  def copyIn(x: BufferParams): T
  def copyOut(x: BufferParams): T
  def copyInOut(x: BufferParams): T
}

// TODO move to AMBA package
case class AXI4BufferParams(
  aw: BufferParams = BufferParams.none,
  w:  BufferParams = BufferParams.none,
  b:  BufferParams = BufferParams.none,
  ar: BufferParams = BufferParams.none,
  r:  BufferParams = BufferParams.none
) extends DirectedBuffers[AXI4BufferParams] {
  def copyIn(x: BufferParams) = this.copy(b = x, r = x)
  def copyOut(x: BufferParams) = this.copy(aw = x, ar = x, w = x)
  def copyInOut(x: BufferParams) = this.copyIn(x).copyOut(x)
}

// TODO move to TL package
case class TLBufferParams(
  a: BufferParams = BufferParams.none,
  b: BufferParams = BufferParams.none,
  c: BufferParams = BufferParams.none,
  d: BufferParams = BufferParams.none,
  e: BufferParams = BufferParams.none
) extends DirectedBuffers[TLBufferParams] {
  def copyIn(x: BufferParams) = this.copy(b = x, d = x)
  def copyOut(x: BufferParams) = this.copy(a = x, c = x, e = x)
  def copyInOut(x: BufferParams) = this.copyIn(x).copyOut(x)
}

${comp.busInterfaces.map(perBusInterfaceParams(comp)).join('\n')}

case class N${comp.name}TopParams(
    blackbox: ${comp.name}Params,
${indent(4)(comp.busInterfaces.map(e =>
        `${e.name}Params: P${e.name}Params`
    ).join(',\n'))}
) {
  def setBurstBytes(x: Int): N${comp.name}TopParams = this.copy(
${indent(4)(comp.busInterfaces.map(e =>
        `${e.name}Params = ${e.name}Params.copy(burstBytes = x)`
    ).join(',\n'))}
  )
}

object N${comp.name}TopParams {
  def defaults(control: BigInt = 0x60000, burstBytes: Int = 64) =
    N${comp.name}TopParams(
      blackbox = ${comp.name}Params(control),
${indent(6)(comp.busInterfaces.map(e =>
        `${e.name}Params = P${e.name}Params(burstBytes)`
    ).join(',\n'))}
    )
}

// stub: class N${comp.name}Top extends N${comp.name}TopBase
class N${comp.name}Top(c: N${comp.name}TopParams)(implicit p: Parameters) extends SimpleLazyModule
{
  val imp = LazyModule(new DiplomaticBrick(c.blackbox))

${indent(2)(comp.busInterfaces.map(e =>
        generators[e.busType.name][e.interfaceMode].node(e)
    ).join('\n'))}
}

// Maybe reusable by System Integrator
object N${comp.name}Top {
  def attach(c: N${comp.name}TopParams)(bap: BlockAttachParams) {
    implicit val p: Parameters = bap.p
    val name = LazyModule(new N${comp.name}Top(c))
    // val vip = testHarness { LazyModule(new VIP(c))  }
    // vip.pads := name.imp.pads
${indent(4)(comp.busInterfaces.map(e =>
        generators[e.busType.name][e.interfaceMode].attach(e)
    ).join('\n'))}
  }
}

/// FOR CI integration tests only
class With${comp.name}Top extends Config((site, here, up) => {
  case BlockDescriptorKey =>
    BlockDescriptor(
      name = "${comp.name}",
      place=N${comp.name}Top.attach(N${comp.name}TopParams.defaults(burstBytes = site(CacheBlockBytes)))) +: up(BlockDescriptorKey, site)
})


`;
};
