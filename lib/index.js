'use strict';

const fs = require('fs-extra');
const JSON5 = require('json5');
const Ajv = require('ajv');
const get = require('lodash.get');

const scafolder = require('./scafolder');
const genVerilogBBX = require('./gen-verilog-bbx.js');
// const genSpirit = require('./gen-spirit.js');
const genHeaderFile = require('./export-header-file.js');
const schema = require('duh-schema');
// const genMill = require('./mill.js');
const template = require('./template.js');
const readDuh = require('./read-duh.js');
const expandAll = require('./expand-all.js');

exports.header = argv => new Promise(resolve => {
  if (argv.verbose) console.log('generate');
  readDuh(argv)
    .then(expandAll)
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
  readDuh(argv)
    .then(expandAll)
    .then(duh1 => {
      const dir = argv.output;
      fs.outputFile(`${dir}/${duh1.component.name}-bbx.v`, genVerilogBBX(duh1))
        .then(resolve);
    });
});

exports.validate = argv => new Promise(resolve => {
  if (argv.verbose) console.log('validate');
  readDuh(argv).then(duh => {
    const ajv = new Ajv;
    const validate = ajv
      .addSchema(schema.defs)
      .compile(schema.any);

    const valid = validate(duh);
    if (!valid) console.log(validate.errors);
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
  const path = argv.value || '.';
  readDuh(argv).then(expandAll).then(duh1 => {
    const val = get(duh1, path);
    console.log(JSON.stringify(val));
    resolve();
  });
});

/* eslint no-console:0 */
