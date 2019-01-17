#!/usr/bin/env node
'use strict';

const yargs = require('yargs');
const path = require('path');

const lib = require('../lib/index.js');

yargs
    .version()
    .help()
    .argv;

async function main (argv) {
    const cwd = process.cwd();
    const folderName = path.basename(cwd);
    const fileName = argv._[0] || (folderName + '.json5');

    await lib.generate({
        filename: fileName
    });
}

main(yargs.argv);
