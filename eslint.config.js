'use strict';

const config = require('@drom/eslint-config'); // eslint9/node22 flat config
const globals = require('globals');

module.exports = [
  { ignores: ['bin/gemini.js', 'coverage/**', '.c8_output/**'] },
  { files: ['**/*.js'], ...config },
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser, ...globals.mocha }
    }
  }
];
