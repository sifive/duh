'use strict';

module.exports = {
    generate: argv => {
        if (argv.verbose) {
            console.log('generate');
        }
    },
    test: argv => {
        if (argv.verbose) {
            console.log('test');
        }
    }
};
/* eslint no-console:0 */
