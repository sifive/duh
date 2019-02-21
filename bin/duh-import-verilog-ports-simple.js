#!/usr/bin/env node
'use strict';

const yargs = require('yargs');
const path = require('path');
const JSON5 = require('json5');
const concat = require('concat-stream');
const fs = require('fs-extra');

const pinlister = require('pinlist/lib/pinlister-simple.js');

const argv = yargs
  .option('output', {
    alias: 'o',
    describe: 'result file'
  })
  .version()
  .help()
  .argv;

async function gotInput(source) {
  const folderName = path.basename(process.cwd());
  const fileName = argv._[0] || folderName + '.json5';
  const duhRaw = await fs.readFile(fileName, 'utf-8');
  const duh = JSON5.parse(duhRaw);
  const pins = pinlister(source);
  duh.definitions = duh.definitions || {};
  duh.definitions.ports = duh.definitions.ports || {};
  duh.definitions.ports = pins;
  duh.component = duh.component || {};
  duh.component.model = duh.component.model || {};
  duh.component.model.ports = { $ref: '#/definitions/ports' };

  const outputFileName = argv.output || fileName;
  await fs.outputFile(outputFileName, JSON5.stringify(duh, null, 2));

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
