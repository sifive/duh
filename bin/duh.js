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
        handler: lib.validate,
        builder: (yargs) => {
            yargs.option('input', {
                alias: 'i',
                desc: 'input component json',
                demandOption: true
            });
        }
    })
    .command({
        command: 'generate',
        aliases: ['gen'],
        desc: 'generate wrapper',
        handler: lib.generate,
        builder: (yargs) => {
            yargs
                .option('input', {
                    alias: 'i',
                    desc: 'input component json',
                    demandOption: true
                })
                .option('dir', {
                    alias: 'd',
                    desc: 'output directory',
                    demandOption: true
                })
                .option('scalaDir', {
                    alias: 's',
                    desc: 'output directory of scala wrapper',
                    demandOption: true
                });
        }
    })
    .command({
        command: 'test',
        desc: 'test description',
        handler: lib.test
    })
    .demandCommand()
    .help()
    .argv;
