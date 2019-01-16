'use strict';

const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const JSON5 = require('json5');
const jsonRefs = require('json-refs');
const Ajv = require('ajv');

const expandPorts = require('./expand-ports.js');
const expandPortMaps = require('./expand-port-maps.js');
const genScala = require('./gen-scala.js');
const genVerilogBBX = require('./gen-verilog-bbx.js');
const genSpirit = require('./gen-spirit.js');
const schema = require('./schema.js');
const genMill = require('./mill.js');

const readFile = util.promisify(fs.readFile);
const outputFile = util.promisify(fs.outputFile);

const readDuh = async argv => {
    if (argv.verbose) console.log('reading spec');

    // read duh.json
    const duhPath = argv.input;
    const duhRaw = await readFile(duhPath, 'utf-8');
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

exports.generate = async argv => {
    if (argv.verbose) console.log('generate');
    const duh = await readDuh(argv);
    const dir = argv.dir;
    // generate expanded json5
    await outputFile(`${dir}/${duh.component.name}.json5`, JSON5.stringify(duh, null, 2));
    // generate expanded IP-XACT
    // TODO
    // generate Scala wrapper
    await outputFile(`${dir}/src/${duh.component.name}.scala`, genScala(duh));

    await outputFile(`${dir}/build.sc`, genMill(duh));
    // copy files into resource directory
    const resourceDir = `${dir}/resources`;
    const sourceDir = path.dirname(argv.input);
    duh.component.fileSets.map(fileSet => fileSet.files.map(f => {
        const source = `${sourceDir}/${f}`;
        fs.copySync(source, `${resourceDir}/${f}`);
    }));

    // generate verilog black box
    await outputFile(`${dir}/${duh.component.name}-bbx.v`, genVerilogBBX(duh));
    // generate Spirit
    await outputFile(`${dir}/${duh.component.name}.xml`, genSpirit(duh));

};

exports.validate = async argv => {
    if (argv.verbose) console.log('validate');
    const duh = await readDuh(argv);
    const ajv = new Ajv();
    const valid = ajv.validate(schema, duh);
    if (!valid) console.log(ajv.errors);

};

exports.test = async argv => {
    if (argv.verbose) {
        console.log('test');
    }
};

/* eslint no-console:0 */
