'use strict';

module.exports = function (props) {
    // console.log(props);
    let res = {};

    if (props.docType === 'component') {
        res.component = {
            vendor: 'sifive',
            library: 'blocks',
            name: props.name,
            version: props.version,
            busInterfaces: [],
            addressSpaces: [],
            memoryMaps: [],
            model: {
                views: [],
                ports: {}
            },
            fileSets: {},
            pSchema: {}
        };
    }

    if (props.docType === 'design') {
        res.design = {};
    }
    return res;
};
