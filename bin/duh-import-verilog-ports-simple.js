#!/usr/bin/env node
'use strict';

const yargs = require('yargs');
const path = require('path');
const util = require('util');
const JSON5 = require('json5');
const concat = require('concat-stream');
const fs = require('fs-extra');

const pinlist = require('pinlist');

const simplify = require('pinlist/lib/simplify.js');
const minusValue = require('pinlist/lib/minus-value.js');

const readFile = util.promisify(fs.readFile);
const outputFile = util.promisify(fs.outputFile);

const argv = yargs
    .version()
    .help()
    .argv;

const pinlister = (source) => {
    const l1 = source.match(/[^\r\n]+/g);
    const l2 = l1.reduce((res, line) => {

        const m2 = line.match(/^\s*(input|output)\s+(wire)\s+\[(.+):(.+)\]\s+(\w+)/);
        if (m2) {
            const left = simplify(m2[3]);
            const right = simplify(m2[4]);
            const width = simplify(left + '-' + right + '+1');
            res[m2[5]] = (m2[1] === 'input') ? width : minusValue(width);
            return res;
        }

        const m1 = line.match(/^\s*(input|output)\s+(wire)\s+(\w+).+/);
        if (m1) {
            res[m1[3]] = (m1[1] === 'input') ? 1 : -1;
            return res;
        }

        const m3 = line.match(/^\s*(input|output)\s+(\w+).+/);
        if (m3) {
            res[m3[2]] = (m3[1] === 'input') ? 1 : -1;
            return res;
        }

        return res;
    }, {});
    return l2;
    // console.log(l2);
};


async function gotInput (source) {
    const folderName = path.basename(process.cwd());
    const fileName = argv._[0] || (folderName + '.json5');
    const duhRaw = await readFile(fileName, 'utf-8');
    const duh = JSON5.parse(duhRaw);
    const pins = pinlister(source);
    const duhNew = duh;
    duhNew.definitions = duhNew.definitions || {};
    duhNew.definitions.ports = duhNew.definitions.ports || {};
    duhNew.definitions.ports = pins;
    duhNew.component = duhNew.component || {};
    duhNew.component.model = duhNew.component.model || {};
    duhNew.component.model.ports = {$ref: '#/definitions/ports'};
    await outputFile(fileName, JSON5.stringify(duhNew, null, 2));
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
