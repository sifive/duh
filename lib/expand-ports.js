'use strict';

// http://forums.accellera.org/topic/6024-parameters-and-parameterized-port-widths-in-ipxact-1685-2009/

const expandPorts = ports => {
  if (ports.constructor !== Object) {
    return ports;
  }

  return Object.keys(ports).reduce((res, name) => {
    let width = ports[name];
    let direction = 'in';

    if (typeof width === 'number') {
      if (width < 0) {
        width = -width;
        direction = 'out';
      }
    } else if (typeof width === 'string') {
      if (width.slice(0, 1) === '-') {
        width = width.slice(1);
        direction = 'out';
      }
    } else {
      throw new Error(typeof width);
    }

    return res.concat({
      name: name,
      wire: {
        direction: direction,
        width: width
      }
    });
  }, []);
};

module.exports = expandPorts;
