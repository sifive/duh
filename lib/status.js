'use strict';
const path = require('path');
var fs = require('fs');
const chalk = require('chalk');
var jsyaml = require('js-yaml');
let ports;
let busDefs;
let regKeys;
let keysLen = 0;
const common = argv => new Promise(() => {
  const folderName = path.basename(process.cwd());
  const fileName = argv.filename || folderName + '.json5';
  let rawdata = fs.readFileSync(fileName);
  let ldData = jsyaml.safeLoadAll(rawdata);
  let defs = ldData[0]['definitions'];
  let comps = ldData[0]['component'];
  let busInt = comps['busInterfaces'];
  let addrSpaces = comps['addressSpaces'];
  let memMaps = comps['memoryMaps'];
  let addrBlocks;
  let regs;
  let cnt = 0;
  let outs = 0;
  let ins  = 0;
  let str = '';
  let metrics = ['Ports\t\t', 'Bus Interfaces\t', 'Un-mapped Ports', 'Address Spaces\t', 'Memory Maps\t', 'Address Blocks\t', 'Registers\t', 'Fields\t\t'];
  let size = Array(8).fill(0);
  if (defs != undefined) {
    ports = defs['ports'];
    busDefs = defs['busDefinitions'];
  }
  if (ports != undefined) {
    let portskeys = Object.keys(ports);
    let portswidth = Object.values(ports);

    for (let index = 0; index < portswidth.length; index++) {
      if (typeof(portswidth[index]) == 'number') {
        if (portswidth[index]>0) {
          ins = ins + portswidth[index];
        } else {
          outs = outs + portswidth[index];
        }
      } else {
        str = '(Expression Excluded)';
      }
    }
    size[0] = portskeys.length;
  }
  if (busInt != undefined) {
    size[1] = busInt.length;
  }
  if (addrSpaces != undefined) {
    size[3] = addrSpaces.length;
  }
  if (memMaps != undefined) {
    size[4] = memMaps.length;
    if (size[4]>0) {
      addrBlocks = memMaps[0]['addressBlocks'];
    }
  }
  if (addrBlocks != undefined) {
    regs = addrBlocks[0]['registers'];
    size[5] = addrBlocks.length;
  }
  if (regs != undefined) {
    size[6] = regs.length;
    for (var values in regs){
      regKeys = Object.keys(regs[values]['fields'][0]);
      keysLen = keysLen + regKeys.length;
      size[7] = keysLen;
    }
  }
  console.info(chalk.bold.blue('\n\t  METRICS OF COMPONENT\t\n'));
  for (let index = 0; index < size.length; index++) {
    if (index == 2 && size[2] > 0) {
      console.log('\t', metrics[index], ' : ', chalk.red(size[index]));
    } else {
      console.log('\t', metrics[index], ' : ', size[index]);
    }
        
    if (index == 1 && size[1] >=1) {
      console.log(chalk.bold.cyan('\t -\t Number\t\t  : type\t\t  : name\t\t '));
      for (let index = 0; index < (size[1]); index++) {
        let ref = busInt[index]['$ref'];
        let refList = ref.split('-');
        let refListPg = ref.split('/');
        let portKeys = refListPg[3];
        let defBsbnd = refList[0].split('/');
        let typeMs = refList[4];
        let typName = refList[5];
        if (defBsbnd[2] == 'busDefinitions') {
          for (let index = 6; index <= refList.length-1; index++) {
            typName = typName + ' ' + refList[index];
          }
          typName = typName.split('_')[0];
          console.log('\t ->\t', cnt, '\t\t  :', typeMs, '\t\t  :', typName);
          busDefs= defs['busDefinitions'][portKeys];
          let umaps = busDefs['abstractionTypes'][0]['portMaps']['__UMAP__'];
          if (umaps != undefined) {
            size[2] = size[2] + umaps.length;
          }
        } else {
          console.log('\t ->\t', cnt, '\t\t  :', 'null\t\t  :', refList[1]);
        }
        cnt = cnt + 1;
      }
    }
  }
  console.log('\t Input Width \t  : ', ins, 'bits', chalk.red(str));
  console.log('\t Output Width\t  : ', Math.abs(outs), 'bits', chalk.red(str));
  console.log('\n');
});

module.exports = common;
