#!/usr/bin/env node
'use strict';

const yargs = require('yargs');
const path = require('path');

const lib = require('../lib/index.js');

const argv = yargs
  .option('output', {
    alias: 'o',
    describe: 'output path for exported files',
    default: '.'
  })
  .version()
  .help()
  .argv;

async function main(argv) {
  const cwd = process.cwd();
  const folderName = path.basename(cwd);
  const fileName = argv._[0] || folderName + '.json5';

  await lib.verilogBBX({
    filename: fileName,
    output: argv.output
  });
}

main(argv);
