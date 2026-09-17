'use strict';

const path = require('path');
const readline = require('node:readline');

// ask a text question, falling back to `def` on empty input
const ask = async (askQ, message, def) => {
  const suffix = def !== undefined ? ` (${def})` : '';
  const res = (await askQ(`${message}${suffix}: `)).trim();
  return res === '' ? def : res;
};

// ask a numbered choice question (inquirer "rawlist" equivalent)
const askChoice = async (askQ, message, choices, defIdx = 0) => {
  choices.forEach((c, i) => process.stdout.write(`  ${i + 1}) ${c}\n`));
  for (;;) {
    const res = (await askQ(`${message} [${defIdx + 1}]: `)).trim();
    if (res === '') return choices[defIdx];
    const n = Number.parseInt(res, 10);
    if (Number.isInteger(n) && n >= 1 && n <= choices.length) {
      return choices[n - 1];
    }
    if (choices.includes(res)) return res;
    process.stdout.write('invalid selection, try again\n');
  }
};

const common = argv => (async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  // serve questions from our own line queue; rl.question() only routes one
  // line to the pending question and drops the rest as 'line' events when
  // piped input arrives in a batch
  const buffer = [];
  const waiters = [];
  let closed = false;
  rl.on('line', l => {
    const w = waiters.shift();
    if (w) w.resolve(l);
    else buffer.push(l);
  });
  rl.on('close', () => {
    closed = true;
    while (waiters.length) {
      waiters.shift().reject(new Error('input ended'));
    }
  });
  const askQ = message => {
    process.stdout.write(message);
    if (buffer.length) return Promise.resolve(buffer.shift());
    if (closed) return Promise.reject(new Error('input ended'));
    return new Promise((resolve, reject) => waiters.push({ resolve, reject }));
  };
  try {
    const folderName = path.basename(process.cwd());
    const fileName = argv.filename || folderName + '.json5';
    const props = {
      fileName: await ask(askQ, 'Document file name', fileName),
      name: await ask(askQ, 'Block name', folderName),
      version: await ask(askQ, 'version', '0.1.0'),
      description: (await ask(askQ, 'Please write a short description about the block')) || '',
      docType: await askChoice(askQ, 'Block type', ['component', 'design'])
    };
    if (props.docType === 'component') {
      props.sourceType = await askChoice(askQ, 'Source type', ['Verilog', 'Scala']);
    }
    return props;
  } finally {
    rl.close();
  }
})();

module.exports = common;
