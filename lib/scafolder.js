'use strict';

const path = require('path');
const inquirer = require('inquirer');

const component = props => new Promise(resolve =>
  inquirer.prompt({
    type: 'rawlist',
    name: 'sourceType',
    message: 'Source type',
    choices: ['Verilog', 'Scala'],
    default: 0
  }).then(res => resolve(Object.assign(props, res))));

const common = argv => new Promise(resolve => {
  const folderName = path.basename(process.cwd());
  const fileName = argv.filename || folderName + '.json5';
  let props = {};
  inquirer.prompt([
    {
      type: 'input',
      name: 'fileName',
      message: 'Document file name',
      default: fileName
    },
    {
      type: 'input',
      name: 'name',
      message: 'Block name',
      default: folderName
    },
    {
      type: 'input',
      name: 'version',
      message: 'version',
      default: '0.1.0'
    },
    {
      type: 'input',
      name: 'description',
      message: 'Please write a short description about the block'
    },
    {
      type: 'rawlist',
      name: 'docType',
      message: 'Block type',
      choices: ['component', 'design'],
      default: 0
    }
  ]).then(res => {
    Object.assign(props, res);
    if (props.docType === 'component') {
      component(props).then(resolve(props));
    }
  });
});

module.exports = common;
