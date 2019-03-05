'use strict';

const liner = (arr, cb) => arr.map(cb).join('\n');

const blackList = {
  AWQOS: true,
  ARQOS: true,
  WID: true
};

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

const genBusInterface = comp => e => {
  const fullName = 'V' + comp.name + '/' + e.name;
  const isMaster = e.interfaceMode === 'master';
  return `
::pct::add_block_port V${comp.name} ${e.name} InOut
::pct::set_block_port_protocol ${fullName} SYSTEM_LIBRARY:${isMaster ? 'AXI4Target' : 'AXI4Initiator'}
::pct::set_param_value ${fullName} {Port Properties} MasterSlaveness ${isMaster ? 'Master' : 'Slave'}

${e.abstractionTypes[0].portMaps.map(p => (blackList[p.logicalPort.name] === undefined) ? `
::pct::remove_block_port V${comp.name}/${p.physicalPort.name}
::pct::map_encap_port V${comp.name}/V${comp.name}/${p.physicalPort.name} ${e.name} ${p.logicalPort.name}` : '').join('\n')}
`;
};

const genBusInterfaceTransactor = () => e => {
  const isMaster = e.interfaceMode === 'master';

  return `
::pct::instantiate_block Transactor__${isMaster ? 'FT__AXI4TargetPA' : 'AXI4InitiatorPA__FT'} \
\${hiearchy} ${e.name}_transactor
::pct::create_connection ${e.name}_c CPU/${e.name} ${e.name}_transactor/AXI4${isMaster ? 'Out' : 'In'}
::pct::externalize_port ${e.name}_transactor/${isMaster ? 'in' : 'out'}FTAXI ${e.name}_tlm ${e.name}_tlm_c
::pct::add_ports_to_connection clock_c ${e.name}_transactor/CLK
::pct::add_ports_to_connection reset_c ${e.name}_transactor/RST`;
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


set hiearchy /HARDWARE/HW/HW

::mco20::instantiate_vpu . i_dummy_vpu VPU_20:Stochastic_PE {PE} VPU_20:MEM_DRVR {DRVR}

::pct::instantiate_block V${comp.name} \${hiearchy} CPU
::pct::externalize_port CPU/clock clock clock_c
::pct::externalize_port CPU/reset reset reset_c

::pct::open_library "GenericIPlib"

::pct::set_stub_block CPU/reset_vector_0 "GenericIPlib:SigDrive" reset_vector_stub
::pct::set_param_value reset_vector_stub "Template Arguments" DATA_TYPE sc_uint<40>
::pct::set_param_value reset_vector_stub "Extra properties" stub_value 0x40000000


::pct::add_ports_to_connection clock_c CPU/core_clock_0

# FIXME divide clock by 4
::pct::add_ports_to_connection clock_c CPU/rtc_toggle

::pct::add_ports_to_connection clock_c i_dummy_vpu/PE_p_clk
::pct::add_ports_to_connection clock_c i_dummy_vpu/DRVR_p_clk

::pct::open_library "FT_Pin_Transactors"
${liner(comp.busInterfaces, genBusInterfaceTransactor(comp))}

::mco20::encapsulate ${comp.name} -instances [list i_dummy_vpu CPU front_transactor sys_transactor periph_transactor]

::mco20::edit_encap i_${comp.name}

::mco20::re_encapsulate ${comp.name}

# ::pct::export_system_library ${comp.name} SiFive_${comp.name}_Lib.xml

::pct::set_project_name ${comp.name}

::pct::save_system "${comp.name}_SubSystem.xml"
`;
};

exports.tcl = tcl;

exports.setup = () => {
  return `#!/bin/sh
export EDA_ROOT=/sifive/tools
export VERILATOR_ROOT=\${EDA_ROOT}/verilator/4.008/share/verilator

source \${EDA_ROOT}/synopsys/pa/O-2018.09-SP1-2/VPProducts/SLS/linux/PlatformArchitectUltra.sh

export SNPS_VP_COMPILER="gcc-5.2.0-64"
# export SNPS_VP_COMPILER="gcc-6.2.0-64"

echo \${SNPS_VP_PRODUCT}
echo \${SNPS_VP_COMPILER}

export SYSTEMC=\${SNPS_VP_HOME}/common

export COWARE_CXX_COMPILER=\${SNPS_VP_COMPILER}
export PATH=\${SNPS_VP_HOME}/gnu/\${SNPS_VP_COMPILER}-64/bin:$PATH
export LD_LIBRARY_PATH=\${SNPS_VP_HOME}/gnu/\${SNPS_VP_COMPILER}-64/lib:\${LD_LIBRARY_PATH}
export LD_LIBRARY_PATH=\${SNPS_VP_HOME}/gnu/\${SNPS_VP_COMPILER}-64/lib64:\${LD_LIBRARY_PATH}

export LD_LIBRARY_PATH=\${SYSTEMC}/lib-linux64:\${LD_LIBRARY_PATH}
`;
};

exports.build = duh => {
  const comp = duh.component;
  return `
time \${VERILATOR_ROOT}/../../bin/verilator_bin \\
  -Wall \\
  -Wno-UNUSED \\
  -O3 -CFLAGS "$CFLAGS" --sc \\
  --pins-sc-uint --pins-sc-biguint \\
  --Mdir V${comp.name} \\
  -Irtl \\
  --top-module ${comp.name} \\
  rtl/*.v \\

sleep 5

ll V${comp.name}
rm V${comp.name}/V${comp.name}.h.bak
mv V${comp.name}/V${comp.name}.h V${comp.name}/V${comp.name}.h.bak

sleep 1

sed 's/sc_uint\\(.*_\\(r\\|w\\)_bits_data\\)/sc_biguint\\1/g; s/<bool>\\(.*_\\(ar\\|r\\|aw\\|b\\)_bits_id\\)/<sc_uint<1> >\\1/g' V${comp.name}/V${comp.name}.h.bak > V${comp.name}/V${comp.name}.h

sleep 1

time make CXXFLAGS=-std=c++11 -j -C V${comp.name} -f V${comp.name}.mk
`;
};
