'use strict';

const axi4Tl = require('./axi4-tl');
const intcTl = require('./intc-tl');
const exportScalaChannel = require('./export-scala-channel');
const signValue = require('./sign-value');
const traverseSpec = require('./traverse-spec');
const flipString = require('./flip-string');
const indent = require('./indent');
const parts = require('./export-scala-parts.js');

const generators = {
  AXI4: axi4Tl,
  interrupts: intcTl,
  channel: exportScalaChannel
};

const buses = {
  'amba.com': {
    AMBA4: {
      AXI4: axi4Tl.busDef
    }
  },
  'sifive.com': {
    free: {
      channel: exportScalaChannel.busDef,
      interrupts: intcTl.busDef
    }
  }
};

const getBusName = path => flipString(
  (path.length === 1) ? path[0] : (path[0] + path[path.length - 1]));

const dir = p => body =>
  (p === 'in' ? 'Input' : p === 'out' ? 'Output' : p) + '(' + body + ')';

const type = p => (p === 1 ? 'Bool()' : 'UInt(' + p + '.W)');

const perPort = e => {
  const rhs = dir(e.wire.direction)(type(e.wire.width));
  return `  val ${e.name} = ${rhs}`;
};

const perBusInterface = comp => e => {
  const generator = generators[e.busType.name] || {};
  const handle = generator[e.interfaceMode].adapter
    || (() => () => 'unknownBusType()');
  return `  val ${e.name}Node = ${handle(comp)(e)}`;
};

const logicalPortMap = portMap =>
  portMap.reduce((prev, cur) => {
    prev[cur.logicalPort.name] = cur;
    return prev;
  }, {});

const perBusInterfaceAlias = () => e =>
  `val (${e.name}0, _) = ${e.name}Node.${
    e.interfaceMode == 'slave' ? 'in' : 'out'
  }(0)`;

const perBusInterfaceParams = comp => e => {
  const generator = generators[e.busType.name] || {};
  const handle =
    generator[e.interfaceMode].params || (() => 'unknownBusType()');
  return handle(comp)(e);
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
          res += path[0] ? '// ' + path[0] + '\n' : '';
          return;
        }

        const busName = getBusName(path);
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
          res += `${e.name}0.${tlName} := ${
            sig.value === 1 ? 'true.B' : '0.U'
          }\n`;
          return;
        }
        res += '// ' + busName + '\n';
      }
    })(bus);
    return res;
  };
};

const perBundlePortWiring = () => e => {
  const h1 = 'ioBridgeSource.bundle.' + e.name;
  const h2 = 'blackbox.io.' + e.name;
  if (e.wire.direction === 'out') {
    return h1 + ' := ' + h2;
  }
  return h2 + ' := ' + h1;
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
  return `// Generated Code
// Please DO NOT EDIT

${parts.header(comp)}

class ${comp.name}BlackBoxIO(
${Object.keys(comp.model.ports.reduce(reducePortParameter, {}))
    .map(p => `  val ${p}: Int`)
    .join(',\n')}
) extends Bundle {
${comp.model.ports.map(perPort).join('\n')}
}

class ${comp.name}(
${Object.keys(comp.model.ports.reduce(reducePortParameter, {}))
    .map(p => `  val ${p}: Int`)
    .join(',\n')}
) extends BlackBox(Map(
${Object.keys(comp.model.ports.reduce(reducePortParameter, {}))
    .map(p => `  "${p}" -> core.IntParam(${p})`)
    .join(',\n')}
)) with HasBlackBoxResource {
  val io = IO(new ${comp.name}BlackBoxIO(${Object.keys(
  comp.model.ports.reduce(reducePortParameter, {})
).join(', ')}))
// setResource("top.v")
}

case class ${comp.name}Params(
  control: BigInt,
${Object.keys(comp.model.ports.reduce(reducePortParameter, {}))
    .map(p => `  ${p}: Int = 64`)
    .join(',\n')})

class L${comp.name}Base(c: ${
  comp.name
}Params)(implicit p: Parameters) extends LazyModule {

${comp.busInterfaces.map(perBusInterface(comp)).join('\n')}

    val ioBridgeSource = BundleBridgeSource(() => new ${comp.name}BlackBoxIO(
${Object.keys(comp.model.ports.reduce(reducePortParameter, {}))
    .map(p => `      c.${p}`)
    .join(',\n')}
    ))

    class L${comp.name}BaseImp extends LazyModuleImp(this) {

    val blackbox = Module(new ${comp.name}(
${Object.keys(comp.model.ports.reduce(reducePortParameter, {}))
    .map(p => `      c.${p}`)
    .join(',\n')}
    ))

${indent(4)(comp.model.ports.map(perBundlePortWiring(comp)).join('\n'))}

${indent(4)(comp.busInterfaces.map(perBusInterfaceAlias(comp)).join('\n'))}

${indent(4)(comp.busInterfaces.map(perBusInterfaceWiring(comp)).join('\n'))}


  }

  lazy val module = new L${comp.name}BaseImp
}

${comp.busInterfaces.map(perBusInterfaceParams(comp)).join('\n')}

case class N${comp.name}TopParams(
    blackbox: ${comp.name}Params,
${indent(4)(
    comp.busInterfaces.map(e => `${e.name}Params: P${e.name}Params`).join(',\n')
  )}
) {
  def setBurstBytes(x: Int): N${comp.name}TopParams = this.copy(
${indent(4)(
    comp.busInterfaces
      .map(e => `${e.name}Params = ${e.name}Params.copy(burstBytes = x)`)
      .join(',\n')
  )}
  )
}

object N${comp.name}TopParams {
  def defaults(control: BigInt = 0x60000, burstBytes: Int = 64) =
    N${comp.name}TopParams(
      blackbox = ${comp.name}Params(control),
${indent(6)(
    comp.busInterfaces
      .map(e => `${e.name}Params = P${e.name}Params(burstBytes)`)
      .join(',\n')
  )}
    )
}

class N${comp.name}TopBase(c: N${
  comp.name
}TopParams)(implicit p: Parameters) extends SimpleLazyModule
{
  val imp = LazyModule(new L${comp.name}(c.blackbox))
  ${generators.channel.common.node(comp)}
${indent(2)(
    comp.busInterfaces
      .map(e => generators[e.busType.name][e.interfaceMode].node(comp)(e))
      .join('\n')
  )}
}

object N${comp.name}TopBase {
  def attach(c: N${comp.name}TopParams)(bap: BlockAttachParams): N${
  comp.name
}Top = {
    implicit val p: Parameters = bap.p
    val name = LazyModule(new N${comp.name}Top(c))
    ${generators.channel.common.attach(comp)}
${indent(4)(
    comp.busInterfaces
      .map(e => generators[e.busType.name][e.interfaceMode].attach(comp)(e))
      .join('\n')
  )}
  }
}

class With${comp.name}TopBase extends Config((site, here, up) => {
  case BlockDescriptorKey =>
    BlockDescriptor(
      name = "${comp.name}",
      place=N${comp.name}Top.attach(N${
  comp.name
}TopParams.defaults(burstBytes = site(CacheBlockBytes)))) +: up(BlockDescriptorKey, site)
})


`;
};
