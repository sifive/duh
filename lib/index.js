'use strict';

const fs = require('fs-extra');
const JSON5 = require('json5');
const get = require('lodash.get');
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
  await fs.outputFile(headerFile, genHeaderFile(duh1));
};

// generate verilog black box
exports.verilogBBX = async argv => {
  if (argv.verbose) console.log('generate verilog bbx');
  const duh1 = await duhCore.expandAll(await duhCore.readDuh(argv));
  const dir = argv.output;
  await fs.outputFile(`${dir}/${duh1.component.name}-bbx.v`, genVerilogBBX(duh1));
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
  await fs.outputFile(props.fileName, JSON5.stringify(doc, null, 2));
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
