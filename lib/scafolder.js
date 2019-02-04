'use strict';

const path = require('path');
const inquirer = require('inquirer');

module.exports = async argv => {
  // if (argv.verbose) console.log('init');

  const folderName = path.basename(process.cwd());
  const fileName = argv.filename || folderName + '.json5';

  let props = {};

  async function component() {
    Object.assign(
      props,
      await inquirer.prompt({
        type: 'rawlist',
        name: 'sourceType',
        message: 'Source type',
        choices: ['Verilog', 'Scala'],
        default: 0
      })
    );
  }

  async function common() {
    Object.assign(
      props,
      await inquirer.prompt([
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
      ])
    );

    if (props.docType === 'component') {
      await component();
    }
  }

  await common();

  return props;
};
