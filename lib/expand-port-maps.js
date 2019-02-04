'use strict';

module.exports = function(portMaps) {
  if (portMaps.constructor !== Object) {
    return portMaps;
  }

  return Object.keys(portMaps).reduce((prev, name) => {
    let res = { logicalPort: { name: name } };
    const val = portMaps[name];
    if (typeof val === 'string') {
      res.physicalPort = { name: val };
    }
    if (typeof val === 'number') {
      res.logicalTieOff = val;
    }
    return prev.concat(res);
  }, []);
};
