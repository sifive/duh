#!/usr/bin/env node
'use strict';

const yargs = require('yargs');
const lib = require('../lib/index.js');

yargs
    .option('verbose', {
        alias: 'v',
        default: false
    })
    .command({
        command: 'validate',
        aliases: ['val'],
        desc: 'check specification',
        handler: lib.validate
    })
    .command({
        command: 'generate',
        aliases: ['gen'],
        desc: 'generate wrapper',
        handler: lib.generate
    })
    .command({
        command: 'test',
        desc: 'test description',
        handler: lib.test
    })
    .demandCommand()
    .help()
    .argv;
