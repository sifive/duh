'use strict';

const fsp = require('node:fs/promises');
const { dirname } = require('node:path');
const JSON5 = require('json5');
const get = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj);
const duhBus = require('duh-bus');
const duhCore = require('duh-core');

const scafolder = require('./scafolder');
const genVerilogBBX = require('./gen-verilog-bbx.js');
const genHeaderFile = require('./export-header-file.js');
const template = require('./template.js');
const importVerilog = require('./import-verilog.js');
const inferChannels = require('./infer-channels.js');

const genValidateBus = require('./validate-bus');

// generate .h file
exports.header = async argv => {
  if (argv.verbose) console.log('generate header');
  const duh1 = await duhCore.expandAll(await duhCore.readDuh(argv));
  const dir = argv.output;
  const headerFile = `${dir}/${duh1.component.name}.h`;
  await fsp.mkdir(dirname(headerFile), { recursive: true });
  await fsp.writeFile(headerFile, genHeaderFile(duh1));
};

// generate verilog black box
exports.verilogBBX = async argv => {
  if (argv.verbose) console.log('generate verilog bbx');
  const duh1 = await duhCore.expandAll(await duhCore.readDuh(argv));
  const dir = argv.output;
  const outName = `${dir}/${duh1.component.name}-bbx.v`;
  await fsp.mkdir(dir, { recursive: true });
  await fsp.writeFile(outName, genVerilogBBX(duh1));
};

exports.validate = async argv => {
  if (argv.verbose) console.log('validate');
  const duh = await duhCore.validateSchema(await duhCore.readDuh(argv));
  const validateBus = genValidateBus(duhBus);
  if (!validateBus(duh)) {
    const err = new Error('bus validation failed');
    err.errors = validateBus.errors;
    throw err;
  }
};

exports.scafolder = async argv => {
  const props = await scafolder(argv);
  const doc = template(props);
  await fsp.mkdir(dirname(props.fileName), { recursive: true });
  await fsp.writeFile(props.fileName, JSON5.stringify(doc, null, 2));
};

exports.get = async argv => {
  const path = argv.value;
  const duh = await duhCore.readDuh(argv);
  const val = get(duh, path) || duh;
  console.log(JSON.stringify(val, null, 2));
};

exports.importVerilog = importVerilog;
exports.inferChannels = inferChannels;

/* eslint no-console:0 */
