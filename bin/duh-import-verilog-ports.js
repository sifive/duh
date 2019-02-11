#!/usr/bin/env node
'use strict';

const yargs = require('yargs');
const path = require('path');
const util = require('util');
const JSON5 = require('json5');
const concat = require('concat-stream');
const fs = require('fs-extra');
const pinlist = require('pinlist');

const readFile = util.promisify(fs.readFile);
const outputFile = util.promisify(fs.outputFile);

const argv = yargs.version().help().argv;

const pinlister = pinlist();

async function gotInput(source) {
  const folderName = path.basename(process.cwd());
  const fileName = argv._[0] || folderName + '.json5';
  const duhRaw = await readFile(fileName, 'utf-8');
  const duh = JSON5.parse(duhRaw);
  const pins = pinlister(source);
  const comp = pins[duh.component.name];
  if (comp === undefined) {
    throw new Error(`module "${duh.component.name}" not found in the provided Verilog source.
Existing candidates are: ${Object.keys(pins)}` );
  }
  duh.definitions = duh.definitions || {};
  duh.definitions.ports = duh.definitions.ports || {};
  duh.definitions.ports = comp.ports;
  duh.component = duh.component || {};
  duh.component.model = duh.component.model || {};
  duh.component.model.ports = { $ref: '#/definitions/ports' };
  await outputFile(fileName, JSON5.stringify(duh, null, 2));
  // console.log(JSON5.stringify(pins, null, 2));
}

const concatStream = concat(gotInput);

let source;

// if (process.stdin.isTTY) {
source = process.stdin.setEncoding('ascii');
// }

if (source) {
  source.pipe(concatStream);
} else {
  yargs.showHelp();
}
