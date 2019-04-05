'use strict';

const indent = require('./indent.js');

const dir = {
  'in': 'Input(',
  'out': 'Output('
};

const stype = wire =>
  dir[wire.direction] +
  ((wire.width === 1) ? 'Bool()' : 'UInt(' + wire.width +'.W)') +
  ')';

const portMapper = porto => {

  const rec = portMaps => key => {
    const val = portMaps[key];

    let res = 'val `' + key + '` = ';

    if (typeof val === 'string') {
      res += stype(porto[val].wire);
    } else
    if (Array.isArray(val)) {
      res += 'MixedVec(Seq(\n';
      res += indent(2)(val
        .map(e => porto[e].wire)
        .map(stype)
        .join(',\n')
      );
      res += '\n))';
    } else
    if (typeof val == 'object') {
      res += 'new Bundle {\n';
      res += indent(2)(Object
        .keys(val)
        .map(rec(val))
        .join('\n')
      );
      res += '\n}';
    } else {
      res += JSON.stringify(val);
    }

    return res;
  };

  return rec;
};

module.exports = comp => {
  // Array of Ports
  const ports = comp.model.ports;

  // Object of Ports
  const porto = ports.reduce((res, cur) => {
    res[cur.name] = cur;
    return res;
  }, {});

  return busInterface => {
    const aType = busInterface.abstractionTypes.find(e => e.viewRef === 'RTLview');
    const portMaps = aType.portMaps;
    return Object
      .keys(portMaps)
      .map(portMapper(porto)(portMaps))
      .join('\n');
  };
};
