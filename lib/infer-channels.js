'use strict';

const path = require('path');
const fs = require('fs-extra');
const JSON5 = require('json5');
const jsonRefs = require('json-refs');

const transpose = obj => {
  let res = {};
  Object.keys(obj).map(key1 => {
    Object.keys(obj[key1]).map(key2 => {
      const t = res[key2] = res[key2] || {};
      t[key1] = obj[key1][key2];
    });
  });
  return res;
};

const nameReducer = sfx => (prev, e) => {
  const m = e.match('^(.+)_' + sfx + '$');
  if (m) {
    prev[m[1]] = e;
  }
  return prev;
};

const inferBusInterfaces = async duh => {
  const duh1 = (await jsonRefs.resolveRefs(duh)).resolved;
  const ports = duh1.component.model.ports;
  const keys = Object.keys(ports);

  const map = {
    vld: 'VALID',
    rdy: 'READY',
    dat: 'BITS'
  };
  const res = ['vld', 'rdy', 'dat'].reduce((prev, sfx) => {
    prev[map[sfx]] = keys.reduce(nameReducer(sfx), {});
    return prev;
  }, {});

  const res1 = transpose(res);

  duh.component.busInterfaces = Object.keys(res1).map(name => {
    const portMaps = res1[name];
    const interfaceMode = (ports[portMaps.VALID] > 0) ? 'slave' : 'master';
    return {
      name: name,
      interfaceMode: interfaceMode,
      busType: {
        vendor: 'sifive.com',
        library: 'basic',
        name: 'channel',
        version: '0.1.0'
      },
      abstractionTypes: [{
        viewRef: 'RTLview',
        portMaps: portMaps
      }]
    };
  });
};

// ensure a minimal component skeleton is present
const fix = duh => {
  const comp = duh.component = duh.component || {};
  comp.vendor = comp.vendor || 'sifive';
  comp.library = comp.library || 'blocks';
  comp.version = comp.version || '0.1.0';
  comp.busInterfaces = comp.busInterfaces || [];
  comp.addressSpaces = comp.addressSpaces || [];
  comp.memoryMaps = comp.memoryMaps || [];
  const model = comp.model = comp.model || {};
  model.views = model.views || [];
  model.ports = model.ports || {};
  comp.fileSets = comp.fileSets || {};
  comp.pSchema = comp.pSchema || {};
};

// argv: { filename, output, verbose }
const inferChannels = async argv => {
  const fileName = argv.filename || path.basename(process.cwd()) + '.json5';
  const duhRaw = await fs.readFile(fileName, 'utf-8');
  const duh = JSON5.parse(duhRaw);
  fix(duh);
  await inferBusInterfaces(duh);

  const outputFileName = argv.output || fileName;
  if (!argv.output) {
    console.error(`warning: no --output given, overwriting input file "${fileName}"`);
  }
  await fs.outputFile(outputFileName, JSON5.stringify(duh, null, 2));
};

module.exports = inferChannels;

/* eslint no-console:0 */
