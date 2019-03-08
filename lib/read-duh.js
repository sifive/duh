'use strict';

const fs = require('fs-extra');
const path = require('path');
const JSON5 = require('json5');
const jsonRefs = require('json-refs');
const expandPorts = require('./expand-ports.js');
const expandPortMaps = require('./expand-port-maps.js');

module.exports = async argv => {
  if (argv.verbose) console.log('reading spec');

  // read duh.json
  const folderName = path.basename(process.cwd());
  const fileName = argv.filename || folderName + '.json5';
  const duhRaw = await fs.readFile(fileName, 'utf-8');
  const duh = JSON5.parse(duhRaw);

  // json dereference
  const duh1 = (await jsonRefs.resolveRefs(duh)).resolved;

  // expand ports
  if (duh1.component !== undefined) {
    const model = duh1.component.model;
    model.ports = expandPorts(model.ports);

    if (duh1.component.busInterfaces !== undefined) {
      // expand portMaps
      duh1.component.busInterfaces = duh1.component.busInterfaces.map(inf => {
        inf.abstractionTypes = inf.abstractionTypes.map(atype => {
          atype.portMaps = expandPortMaps(atype.portMaps);
          return atype;
        });
        return inf;
      });
    }
  }
  return duh1;
};
