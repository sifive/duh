'use strict';

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

const perPortMap = pm =>
    `    ${
        pm.logicalPort.name
    } := ${
        pm.physicalPort.name
    }`;

const perBusInterfaceWiring = e =>
    e.abstractionTypes.map(atype =>
        atype.portMaps.map(perPortMap).join('\n')
    ).join('\n');


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
${comp.busInterfaces.map(perBusInterfaceWiring).join('\n')}
  }

}
`;
};
