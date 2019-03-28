'use strict';

const expandPorts = require('./expand-ports.js');
// const expandPortMaps = require('./expand-port-maps.js');

module.exports = async duh => {

  // expand ports
  if (duh.component !== undefined) {
    const model = duh.component.model;
    model.ports = expandPorts(model.ports);

    // if (duh.component.busInterfaces !== undefined) {
    //   // expand portMaps
    //   duh.component.busInterfaces = duh.component.busInterfaces.map(inf => {
    //     inf.abstractionTypes = inf.abstractionTypes.map(atype => {
    //       atype.portMaps = expandPortMaps(atype.portMaps);
    //       return atype;
    //     });
    //     return inf;
    //   });
    // }
  }

  return duh;
};
