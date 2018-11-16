'use strict';

module.exports = size => {
    let body;
    if (typeof size === 'number') {
        body = (Math.abs(size) > 1) ?
            '[' + (Math.abs(size) - 1) + ':0]' : '';
    } else {
        body = '[' + size + '-1:0]';
    }

    return ((' ').repeat(30) + body + ' ').slice(-30);
};
