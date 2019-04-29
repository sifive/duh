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

exports.header = async argv => {
  if (argv.verbose) console.log('generate');
  const duh = await readDuh(argv);
  const duh1 = await expandAll(duh);
  // const moduleName = duh.component.name;
  const dir = argv.output;

  // generate .h file
  const headerFile = `${dir}/${duh1.component.name}.h`;
  await fs.outputFile(headerFile, genHeaderFile(duh1));

};

// generate verilog black box
exports.verilogBBX = async argv => {
  if (argv.verbose) console.log('generate');
  const duh = await readDuh(argv);
  const duh1 = await expandAll(duh);
  const dir = argv.output;
  await fs.outputFile(`${dir}/${duh1.component.name}-bbx.v`, genVerilogBBX(duh1));
};

exports.validate = async argv => {
  if (argv.verbose) console.log('validate');
  const duh = await readDuh(argv);

  const ajv = new Ajv;

  const validate = ajv
    .addSchema(schema.defs)
    .compile(schema.any);

  const valid = validate(duh);

  if (!valid) console.log(validate.errors);
};

exports.test = async argv => {
  if (argv.verbose) {
    console.log('test');
  }
};

exports.scafolder = async argv => {
  const props = await scafolder(argv);
  const doc = template(props);
  await fs.outputFile(props.fileName, JSON5.stringify(doc, null, 2));
  // await ensureDir('./' + props.name + '/src');
  // console.log(doc);
};

exports.get = async argv => {
  const path = argv.value || '.';
  const duh = await readDuh(argv);
  const duh1 = await expandAll(duh);
  const val = get(duh1, path);
  console.log(JSON.stringify(val));
};

/* eslint no-console:0 */
