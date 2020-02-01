'use strict';

const path = require('path');
const JSON5 = require('json5');
const jsonRefs = require('json-refs');

module.exports = argv => new Promise(resolve => {
  if (argv.verbose) console.log('reading spec');
  const folderName = path.basename(process.cwd());
  const fileName = argv.filename || folderName + '.json5';
  // json dereference
  jsonRefs.resolveRefs({$ref: fileName}, {
    loaderOptions: {
      processContent: function (res, cb) {
        let ml = JSON5.parse(res.text);
        cb(undefined, ml);
      }
    }
  }).then(res => {
    resolve(res.resolved);
  });
});
