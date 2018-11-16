'use strict';

const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const JSON5 = require('json5');
const jsonRefs = require('json-refs');

const expandPorts = require('./expand-ports.js');
const expandPortMaps = require('./expand-port-maps.js');
const genScala = require('./gen-scala.js');

const readFile = util.promisify(fs.readFile);
const outputFile = util.promisify(fs.outputFile);

exports.generate = async argv => {
    if (argv.verbose) console.log('generate');

    // read package.json
    const pkgPath = path.resolve(process.cwd(), 'package.json');
    const pkgRaw = await readFile(pkgPath, 'utf-8');
    const pkg = JSON.parse(pkgRaw);
    if (pkg.duh === undefined) {
        throw new Error('plese define {"duh" : "filename"} in your package.json file');
    }

    // read duh.json
    const duhPath = path.resolve(process.cwd(), pkg.duh);
    const duhRaw = await readFile(duhPath, 'utf-8');
    const duh = JSON5.parse(duhRaw);

    // json dereference
    const duh1 = (await jsonRefs.resolveRefs(duh)).resolved;

    // expand ports
    const model = duh1.component.model;
    model.ports = expandPorts(model.ports);

    // expand portMaps
    duh1.component.busInterfaces = duh1.component.busInterfaces.map(inf => {
        inf.abstractionTypes = inf.abstractionTypes.map(atype => {
            atype.portMaps = expandPortMaps(atype.portMaps);
            return atype;
        });
        return inf;
    });

    // generate expanded json5
    await outputFile('build/duh.json5', JSON5.stringify(duh1, null, 2));

    // generate expanded IP-XACT

    // generate Scala wrapper
    await outputFile('build/duh.scala', genScala(duh1, null, 2));

};

exports.test = async argv => {
    if (argv.verbose) {
        console.log('test');
    }
};

/* eslint no-console:0 */
