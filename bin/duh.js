#!/usr/bin/env node
'use strict';

const path = require('path');
const lib = require('../lib/index.js');
const pkg = require('../package.json');

const HELP = `duh <command> [options]

Commands:
  init [file]                          scaffold a new document (interactive)
  validate <file>                      validate against the DUH schema  (alias: val)
  get <value> [file]                   print a value at a path within the document
  import verilog [file]                import Verilog ports (module == component.name)
  import verilog-simple [file]         import every Verilog pin, no module matching
  infer channels [file]                infer channel bus interfaces from _vld/_rdy/_dat
  export bbx [file]                    export a Verilog black-box wrapper
  export header [file]                 export a C header file

Options:
  -o, --output <path>                  output file/dir (import/infer overwrite input if unset)
  -i, --input <file>                   Verilog source file (import; default: stdin)
  -v, --verbose                        verbose logging
      --version                        print version
  -h, --help                           show this help

When <file> (the duh document) is omitted, commands default to <folder>.json5.
`;

// minimal argv parser: collects positionals in `_`, plus known flags
const parseArgs = argv => {
  const opts = { _: [], verbose: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-o' || a === '--output') opts.output = argv[++i];
    else if (a.startsWith('--output=')) opts.output = a.slice('--output='.length);
    else if (a === '-i' || a === '--input') opts.input = argv[++i];
    else if (a.startsWith('--input=')) opts.input = a.slice('--input='.length);
    else if (a === '-v' || a === '--verbose') opts.verbose = true;
    else if (a === '--version') opts.version = true;
    else if (a === '-h' || a === '--help') opts.help = true;
    else opts._.push(a);
  }
  return opts;
};

const die = msg => {
  console.error(msg);
  process.exit(1);
};

// default the document file to <current-folder>.json5 when omitted
const docDefault = file => file || path.basename(process.cwd()) + '.json5';

const run = (fn, argv) =>
  Promise.resolve()
    .then(() => fn(argv))
    .catch(err => die(err && err.errors ? err.errors : (err && err.stack) || err));

const usage = msg => die(msg + '\n\n' + HELP);

// one handler per command; each reads positionals/flags from opts
const commands = {
  init: opts => run(lib.scafolder, { filename: opts._[1], verbose: opts.verbose }),

  validate: opts => opts._[1]
    ? run(lib.validate, { filename: opts._[1], verbose: opts.verbose })
    : usage('validate: missing <file>'),

  get: opts => opts._[1]
    ? run(lib.get, { value: opts._[1], filename: opts._[2], verbose: opts.verbose })
    : usage('get: missing <value>'),

  import: opts => ['verilog', 'verilog-simple'].includes(opts._[1])
    ? run(lib.importVerilog, {
      filename: opts._[2],
      input: opts.input,
      output: opts.output,
      simple: opts._[1] === 'verilog-simple',
      verbose: opts.verbose
    })
    : usage(`import: unknown target "${opts._[1] || ''}" (verilog | verilog-simple)`),

  infer: opts => opts._[1] === 'channels'
    ? run(lib.inferChannels, { filename: opts._[2], output: opts.output, verbose: opts.verbose })
    : usage(`infer: unknown target "${opts._[1] || ''}" (channels)`),

  export: opts => ({ bbx: lib.verilogBBX, header: lib.header }[opts._[1]])
    ? run({ bbx: lib.verilogBBX, header: lib.header }[opts._[1]], {
      filename: docDefault(opts._[2]),
      output: opts.output || '.',
      verbose: opts.verbose
    })
    : usage(`export: unknown target "${opts._[1] || ''}" (bbx | header)`)
};
commands.val = commands.validate;

const main = () => {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.version) return console.log(pkg.version);
  if (opts.help || opts._.length === 0) return console.log(HELP);

  const handler = commands[opts._[0]];
  return handler ? handler(opts) : usage(`unknown command "${opts._[0]}"`);
};

main();

/* eslint no-console:0 */
