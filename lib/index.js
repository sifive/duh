'use strict';

const fs = require('fs-extra');
const JSON5 = require('json5');
const Ajv = require('ajv');
const get = require('lodash.get');

const scafolder = require('./scafolder');
const genScalaBase = require('./export-scala-base.js');
const genScalaUser = require('./export-scala-user.js');
const genVerilogBBX = require('./gen-verilog-bbx.js');
// const genSpirit = require('./gen-spirit.js');
const genHeaderFile = require('./export-header-file.js');
const schema = require('duh-schema');
// const genMill = require('./mill.js');
const template = require('./template.js');
const readDuh = require('./read-duh.js');

exports.scala = async argv => {
  if (argv.verbose) console.log('generate');
  const duh = await readDuh(argv);
  // const moduleName = duh.component.name;
  const dir = argv.output;

  // generate .h file
  const headerFile = `${dir}/${duh.component.name}.h`;
  await fs.outputFile(headerFile, genHeaderFile(duh));

  // generate Scala wrapper
  const baseFile = `${dir}/${duh.component.name}-base.scala`;
  await fs.outputFile(baseFile, genScalaBase(duh));

  const userFile = `${dir}/${duh.component.name}.scala`;
  if (!(await fs.pathExists(userFile))) {
    await fs.outputFile(userFile, genScalaUser(duh));
  }
};

// generate verilog black box
exports.verilogBBX = async argv => {
  if (argv.verbose) console.log('generate');
  const duh = await readDuh(argv);
  const dir = argv.output;
  await fs.outputFile(`${dir}/${duh.component.name}-bbx.v`, genVerilogBBX(duh));
};

exports.validate = async argv => {
  if (argv.verbose) console.log('validate');
  const duh = await readDuh(argv);
  const ajv = new Ajv();
  const valid = ajv.validate(schema.any, duh);
  if (!valid) console.log(ajv.errors);
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
  const val = get(duh, path);
  console.log(JSON.stringify(val));
};

/* eslint no-console:0 */
