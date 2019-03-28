'use strict';

const fs = require('fs-extra');
const path = require('path');
const JSON5 = require('json5');
const jsonRefs = require('json-refs');

module.exports = async argv => {
  if (argv.verbose) console.log('reading spec');

  // read duh.json
  const folderName = path.basename(process.cwd());
  const fileName = argv.filename || folderName + '.json5';
  const duhRaw = await fs.readFile(fileName, 'utf-8');
  const duh = JSON5.parse(duhRaw);

  // json dereference
  const duh1 = (await jsonRefs.resolveRefs(duh)).resolved;
  return duh1;
};
