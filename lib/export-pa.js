'use strict';

const liner = (arr, cb) => arr.map(cb).join('\n');


const header = () => `
proc getScriptDirectory {} {
  set dispScriptFile [file normalize [info script]]
  set scriptFolder [file dirname $dispScriptFile]
  return $scriptFolder
}
set scriptDir [getScriptDirectory]
::pct::new_project

::pct::open_library "TLM2_PL"
::pct::clear_systemc_defines
::pct::clear_systemc_include_path

::pct::open_library "AXI_PL"
::pct::copy_protocol_to_system_library AXI_PL:AXI4Target
::pct::copy_protocol_to_system_library AXI_PL:AXI4Initiator
`;

// const top = 'VE51_ECoreIPSubsystem';

//
//
// const clocks = [top + '/clock'];
// const resets = [top + '/reset'];
//
// const busInterfaces = [
//   {name: 'fp', interfaceMode: 'slave'},
//   {name: 'sys', interfaceMode: 'master'},
//   {name: 'periph', interfaceMode: 'master'}
// ];

const genBusInterface = comp => e => {
  const fullName = 'V' + comp.name + '/' + e.name;
  const isMaster = e.interfaceMode === 'master';
  return `
::pct::add_block_port V${comp.name} ${e.name} InOut
::pct::set_block_port_protocol ${fullName} SYSTEM_LIBRARY:${isMaster ? 'AXI4Target' : 'AXI4Initiator'}
::pct::set_param_value ${fullName} {Port Properties} MasterSlaveness ${isMaster ? 'Master' : 'Slave'}

${e.abstractionTypes[0].portMaps.map(p => `
::pct::remove_block_port V${comp.name}/${p.physicalPort.name}
::pct::map_encap_port V${comp.name}/V${comp.name}/${p.physicalPort.name} ${e.name} ${p.logicalPort.name}`).join('\n')}
`;
};

const genBusInterfaceTransactor = comp => e => {

  return `
::pct::instantiate_block AXI4Transactor_TLM2FT_PinAccurate /HARDWARE/${comp.name} ${e.name}_transactor
::pct::create_connection ${e.name}_c /HARDWARE/${comp.name}/top/${e.name} /HARDWARE/${comp.name}/${e.name}_transactor/axi_out_PA
::pct::externalize_port /HARDWARE/${comp.name}/${e.name}_transactor/axi_in_TLM2FT ${e.name}_tlm ${e.name}_tlm_c
`;
};

const tcl = duh => {
  const comp = duh.component;

  const includes = [
    '$::env(VERILATOR_ROOT)/include',
    'V' + comp.name
  ];

  const instances = ['V' + comp.name + '/' + 'V' + comp.name + '.h'];
  const clocks = ['V' + comp.name + '/clock'];
  const resets = ['V' + comp.name + '/reset'];
  const flags = [
    '$scriptDir/verilated/' + comp.name + '__ALL.a',
    '$::env(VERILATOR_ROOT)/include/verilated.cpp'
  ];

  return `${header(comp)}
${liner(includes, e => `::pct::add_to_systemc_include_path ${e}`)}
${liner(instances, e => `::pct::load_all_modules --set-category "${e}"`)}
${liner(clocks, e => `::pct::set_block_port_protocol --set-category SYSTEM_LIBRARY:${e} SYSTEM_LIBRARY:CLOCK`)}
${liner(resets, e => `::pct::set_block_port_protocol --set-category SYSTEM_LIBRARY:${e} SYSTEM_LIBRARY:RESET`)}
${liner(comp.busInterfaces, genBusInterface(comp))}

::pct::open_library "AXI_Transactors"

${liner(comp.busInterfaces, genBusInterfaceTransactor(comp))}

::pct::set_simulation_build_project_setting "Debug" "Linker Flags" "${flags.join(' ')}"

::pct::set_simulation_build_project_setting "Debug" "Include Paths" "${includes.join(' ')}"

::pct::export_system_library top top.xml

`;
};

exports.tcl = tcl;

exports.setup = () => {
  return `#!/bin/sh
export EDA_TOOLS=/sifive/tools/
export VERILATOR_ROOT=\${EDA_TOOLS}/verilator/4.008/share/verilator/
export COWAREHOME=\${EDA_TOOLS}/synopsys/pa/O-2018.09-SP1-2/VPProducts/SLS/linux/

source \${COWAREHOME}/PlatformArchitectUltra.sh

export SYSTEMC=\${COWAREHOME}/common/

# export COWARE_CXX_COMPILER=gcc-6.2.0
# export COWARE_CXX_COMPILER=gcc-5.2.0

# export PATH=\${COWAREHOME}../gnu/gcc-6.2.0-64/bin/:$PATH
# export PATH=\${COWAREHOME}../gnu/gcc-5.2.0-64/bin/:$PATH

# export LD_LIBRARY_PATH=\${COWAREHOME}../gnu/gcc-6.2.0-64/lib:\${LD_LIBRARY_PATH}
# export LD_LIBRARY_PATH=\${COWAREHOME}../gnu/gcc-6.2.0-64/lib64:\${LD_LIBRARY_PATH}
# export LD_LIBRARY_PATH=\${COWAREHOME}../gnu/gcc-5.2.0-64/lib:\${LD_LIBRARY_PATH}
# export LD_LIBRARY_PATH=\${COWAREHOME}../gnu/gcc-5.2.0-64/lib64:\${LD_LIBRARY_PATH}
# export LD_LIBRARY_PATH=\${SYSTEMC}/lib-linux64/:\${LD_LIBRARY_PATH}
`;
};

exports.build = duh => {
  const comp = duh.component;
  return `
$VERILATOR_ROOT/../../bin/verilator_bin -sv --Wall -O3 -CFLAGS "$CFLAGS" --sc \\
  --pins-sc-uint --pins-sc-biguint \\
  --Mdir V${comp.name} \\
  -Irtl \\
  --top-module ${comp.name} \\
  rtl/${comp.name}.v
`;
};
