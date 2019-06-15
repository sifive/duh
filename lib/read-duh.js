'use strict';

const fs = require('fs-extra');
const path = require('path');
const JSON5 = require('json5');
const jsonRefs = require('json-refs');

module.exports = argv => new Promise(resolve => {
  if (argv.verbose) console.log('reading spec');

  // read duh.json
  const folderName = path.basename(process.cwd());
  const fileName = argv.filename || folderName + '.json5';
  fs.readFile(fileName, 'utf-8').then(duhRaw => {
    const duh = JSON5.parse(duhRaw);
    // json dereference
    jsonRefs.resolveRefs(duh).then(res => {
      resolve(res.resolved);
    });
  });
});
