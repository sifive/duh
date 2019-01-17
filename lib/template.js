'use strict';

module.exports = function (props) {
    // console.log(props);
    let res = {};

    if (props.docType === 'component') {
        res.component = {
            vendor: 'sifive',
            library: 'blocks',
            name: props.name,
            version: props.version
        };
        res.busInterfaces = [];
        res.addressSpaces = [];
        res.memoryMaps = [];
        res.model = {
            views: [],
            ports: {}
        };
        res.fileSets = [];
        res.pSchema = {};
    }

    if (props.docType === 'design') {
        res.design = {};
    }
    return res;
};
