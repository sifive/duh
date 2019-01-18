'use strict';

const fs = require('fs-extra');
const path = require('path');
const JSON5 = require('json5');
const jsonRefs = require('json-refs');
const Ajv = require('ajv');
const get = require('lodash.get');

const scafolder = require('./scafolder');
const expandPorts = require('./expand-ports.js');
const expandPortMaps = require('./expand-port-maps.js');
const genScalaBase = require('./export-scala-base.js');
const genScalaUser = require('./export-scala-user.js');
// const genVerilogBBX = require('./gen-verilog-bbx.js');
// const genSpirit = require('./gen-spirit.js');
const schema = require('./schema.js');
const genMill = require('./mill.js');
const template = require('./template.js');

const readDuh = async argv => {
    if (argv.verbose) console.log('reading spec');

    // read duh.json
    const folderName = path.basename(process.cwd());
    const fileName = argv.filename || (folderName + '.json5');
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

exports.scala = async argv => {
    if (argv.verbose) console.log('generate');
    const duh = await readDuh(argv);
    // const moduleName = duh.component.name;
    const dir = 'component'; // moduleName; // argv.dir;
    // generate expanded json5
    // await outputFile(`${dir}/${duh.component.name}.json5`, JSON5.stringify(duh, null, 2));
    // generate expanded IP-XACT
    // TODO
    // generate Scala wrapper
    const baseFile = `${dir}/src/${duh.component.name}-base.scala`;
    await fs.outputFile(baseFile, genScalaBase(duh));

    const userFile = `${dir}/src/${duh.component.name}.scala`;
    if (!await fs.pathExists(userFile)) {
        await fs.outputFile(userFile, genScalaUser(duh));
    }

    await fs.outputFile(`${dir}/build.sc`, genMill(duh));

    // copy files into resource directory
    // const resourceDir = `${dir}/resources`;
    // await ensureDir(resourceDir);

    // const sourceDir = path.dirname(argv.input);
    // duh.component.fileSets.map(fileSet => fileSet.files.map(f => {
    //     const source = `${sourceDir}/${f}`;
    //     fs.copySync(source, `${resourceDir}/${f}`);
    // }));

    // generate verilog black box
    // await outputFile(`${dir}/${duh.component.name}-bbx.v`, genVerilogBBX(duh));
    // generate Spirit
    // await outputFile(`${dir}/${duh.component.name}.xml`, genSpirit(duh));

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

exports.scafolder = async argv => {
    const props = await scafolder(argv);
    const doc = template(props);
    await fs.outputFile(props.fileName, JSON5.stringify(doc, null, 2));
    // await ensureDir('./' + props.name + '/src');
    // console.log(doc);
};

exports.get = async argv => {
    const path = argv.value || '.';
    const duh = await readDuh(argv);
    const val = get(duh, path);
    console.log(JSON.stringify(val));
};

/* eslint no-console:0 */
