'use strict';

const findPort = (comp, busDef) => {
  const aType = busDef.abstractionTypes.find(e => e.viewRef === 'RTLview');
  const datPort = aType.portMaps.find(e => e.logicalPort.name === 'DAT');
  const datName = datPort.physicalPort.name;
  return comp.model.ports.find(e => e.name === datName);
};

const masterAdapterGen = comp => e =>
  `IO(new Bundle { // channel master adapter
    val ${e.name} = Decoupled(UInt(${findPort(comp, e).wire.width}.W))
  })
`;

const slaveAdapterGen = comp => e =>
  `IO(new Bundle { // channel slave adapter
    val ${e.name} = Flipped(Decoupled(UInt(${findPort(comp, e).wire.width}.W))
  })
`;

const commonAttachGen = comp =>
  (comp.busInterfaces.find(e => e.busType.name === 'channel'))
    ? 'bap.pbus.coupleTo("channels") { name.channelsNode := TLFragmenter(bap.pbus) := _ }'
    : '// no channel attachment';

const commonNodeGen = comp => {
  if (comp.busInterfaces.find(e => e.busType.name === 'channel')) {

    return `
  val channelsNode = TLRegisterNode(
    address = Seq(AddressSet(0, 0xFFF)),
    device = device,
    beatBytes = beatBytes
  )

  lazy val module = new  LazyModuleImp(this) {

${comp.busInterfaces
    .filter(e => e.busType.name === 'channel')
    .map(e => `    val ${e.name}_queue = Module(new Queue(UInt(${findPort(comp, e).wire.width}.W), 4))`)
    .join('\n')
}

${comp.busInterfaces
    .filter(e => (e.busType.name === 'channel' && e.interfaceMode === 'slave'))
    .map(e => `    imp.channelsNode.${e.name} <> ${e.name}_queue.io.enq`)
    .join('\n')
}

${comp.busInterfaces
    .filter(e => (e.busType.name === 'channel' && e.interfaceMode === 'master'))
    .map(e => `    ${e.name}_queue.io.deq <> imp.channelsNode.${e.name}`)
    .join('\n')
}

    channelsNode.regmap(
${
  comp.busInterfaces
    .filter(e => (e.busType.name === 'channel' && e.interfaceMode === 'slave'))
    .map(e => `RegFieldGroup("${e.name}",Some("${e.name} target channel"), NonBlockingDequeue(${e.name}_queue.io.deq)))`)
    .concat(
      comp.busInterfaces
        .filter(e => (e.busType.name === 'channel' && e.interfaceMode === 'master'))
        .map(e => `Seq(RegGroup("${e.name}",Some("${e.name} initiator channel"), NonBlockingEnqueue(${e.name}_queue.io.enq)))`)
    )
    .map((e, i) => `      ${i * 8} -> ${e}`)
    .join('\n')
}
    )
    := TLBuffer()
  }`;
  }
  return '// no channel node';
};

module.exports = {
  common: {
    adapter: () => '// channel common adapter',
    node: commonNodeGen,
    attach: commonAttachGen
  },
  master: {
    adapter: masterAdapterGen,
    params: () => () => '// channel master params',
    node: () => () => '// channel master node',
    attach: () => () => '// channel master attach'
  },
  slave: {
    adapter: slaveAdapterGen,
    params: () => () => '// channel slave params',
    node: () => () => '// channel slave node',
    attach: () => () => '// channel master attach'
  },
  busDef: {
    vld: 1,
    rdy: -1,
    dat: 'WIDTH'
  }
};
