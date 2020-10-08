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

const genValidateBus = require('./validate-bus');

exports.header = argv => new Promise(resolve => {
  if (argv.verbose) console.log('generate');
  duhCore.readDuh(argv)
    .then(duhCore.expandAll)
    .then(duh1 => {
      const dir = argv.output;

      // generate .h file
      const headerFile = `${dir}/${duh1.component.name}.h`;
      fs.outputFile(headerFile, genHeaderFile(duh1))
        .then(resolve);
    });
});

// generate verilog black box
exports.verilogBBX = argv => new Promise(resolve => {
  if (argv.verbose) console.log('generate');
  duhCore.readDuh(argv)
    .then(duhCore.expandAll)
    .then(duh1 => {
      const dir = argv.output;
      fs.outputFile(`${dir}/${duh1.component.name}-bbx.v`, genVerilogBBX(duh1))
        .then(resolve);
    });
});

exports.validate = argv => new Promise((resolve, reject) => {
  if (argv.verbose) console.log('validate');
  duhCore.readDuh(argv)
    .then(duhCore.validateSchema)
    .then(duh => {
      const validateBus = genValidateBus(duhBus);
      if (!validateBus(duh)) {
        reject(validateBus.errors);
      }
      resolve();
    });
});

exports.scafolder = argv => new Promise(resolve => {
  scafolder(argv).then(props => {
    const doc = template(props);
    fs.outputFile(props.fileName, JSON5.stringify(doc, null, 2))
      .then(resolve);
  });
});

exports.get = argv => new Promise(resolve => {
  const path = argv.value;
  duhCore.readDuh(argv)
    // .then(duhCore.expandAll)
    .then(duh => {
      const val = get(duh, path) || duh;
      console.log(JSON.stringify(val, null, 2));
      resolve();
    });
});

/* eslint no-console:0 */
