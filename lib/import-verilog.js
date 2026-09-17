'use strict';

const path = require('path');
const JSON5 = require('json5');
const fsp = require('node:fs/promises');
const stream = require('node:stream/promises');

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
    return fsp.readFile(input, 'ascii');
  }
  process.stdin.setEncoding('ascii');
  const chunks = [];
  process.stdin.on('data', chunk => chunks.push(chunk));
  return stream.finished(process.stdin, { clean: true })
    .then(() => chunks.join(''));
};

// resolve the duh document file name, defaulting to <folder>.json5
const docFileName = argv =>
  argv.filename || path.basename(process.cwd()) + '.json5';

// argv: { filename, input, output, simple, verbose }
const importVerilog = async argv => {
  const fileName = docFileName(argv);
  const duhRaw = await fsp.readFile(fileName, 'utf-8');
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
  await fsp.mkdir(path.dirname(outputFileName), { recursive: true });
  await fsp.writeFile(outputFileName, JSON5.stringify(duh, null, 2));
};

module.exports = importVerilog;

/* eslint no-console:0 */
