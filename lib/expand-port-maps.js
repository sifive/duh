'use strict';

const expandPortMaps = portMaps => {
    if (portMaps.constructor !== Object) {
        return portMaps;
    }

    return Object.keys(portMaps).reduce((res, name) => {
        return res.concat({
            logicalPort:  {name: name},
            physicalPort: {name: portMaps[name]}
        });
    }, []);
};

module.exports = expandPortMaps;
