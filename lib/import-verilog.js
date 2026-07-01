'use strict';

const path = require('path');
const JSON5 = require('json5');
const fs = require('fs-extra');
const concat = require('concat-stream');

// pinlist ships a native (tree-sitter) build and is an optional dependency;
// load it lazily so the rest of the suite works even when it is unavailable
const loadPinlist = simple => {
  try {
    return simple
      ? require('pinlist/lib/pinlister-simple.js')
      : require('pinlist')();
  } catch (err) {
    throw new Error(
      'Verilog import requires the optional "pinlist" package, which failed to '
      + 'load (it builds a native module). Install it with `npm i pinlist`.\n'
      + 'Original error: ' + err.message
    );
  }
};

// read Verilog source from a file argument or from stdin
const readSource = input => {
  if (input) {
    return fs.readFile(input, 'ascii');
  }
  return new Promise((resolve, reject) => {
    process.stdin.setEncoding('ascii');
    process.stdin.on('error', reject);
    process.stdin.pipe(concat(resolve));
  });
};

// resolve the duh document file name, defaulting to <folder>.json5
const docFileName = argv =>
  argv.filename || path.basename(process.cwd()) + '.json5';

// argv: { filename, input, output, simple, verbose }
const importVerilog = async argv => {
  const fileName = docFileName(argv);
  const duhRaw = await fs.readFile(fileName, 'utf-8');
  const duh = JSON5.parse(duhRaw);

  const source = await readSource(argv.input);

  duh.definitions = duh.definitions || {};
  duh.component = duh.component || {};
  duh.component.model = duh.component.model || {};

  if (argv.simple) {
    duh.definitions.ports = loadPinlist(true)(source);
  } else {
    const pins = loadPinlist(false)(source);
    const comp = pins[duh.component.name];
    if (comp === undefined) {
      throw new Error(`module "${duh.component.name}" not found in the provided Verilog source.
Existing candidates are: ${Object.keys(pins)}`);
    }
    duh.definitions.ports = comp.ports;
  }
  duh.component.model.ports = { $ref: '#/definitions/ports' };

  const outputFileName = argv.output || fileName;
  if (!argv.output) {
    console.error(`warning: no --output given, overwriting input file "${fileName}"`);
  }
  await fs.outputFile(outputFileName, JSON5.stringify(duh, null, 2));
};

module.exports = importVerilog;

/* eslint no-console:0 */
