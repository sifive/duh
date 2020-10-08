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
    command: 'get value [filename]',
    desc: 'get value from the document file',
    handler: lib.get,
    builder: yargs => {
      yargs
        .positional('value', {
          type: 'string',
          desc: 'value path'
        })
        .positional('filename', {
          type: 'string',
          desc: 'document file'
        });
    }
  })
  .command({
    command: 'init [filename]',
    desc: 'creates document file',
    handler: lib.scafolder,
    builder: yargs => {
      yargs.positional('filename', {
        type: 'string',
        desc: 'document file'
      });
    }
  })
  .command({
    command: 'validate filename',
    aliases: ['val'],
    desc: 'validate document',
    handler: lib.validate,
    builder: yargs => {
      yargs.positional('filename', {
        type: 'string',
        desc: 'document file'
      });
    }
  })
  .command({
    command: 'test',
    desc: 'test description',
    handler: lib.test
  })
  .demandCommand()
  .help().argv;
