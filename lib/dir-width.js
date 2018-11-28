'use strict';

module.exports = val => {
    if (typeof val === 'number') {
        return (val < 0) ?
            {width: -val, dir: false} :
            {width: val,  dir: true};
    }
    if (typeof val === 'string') {
        return (val.slice(0, 1) === '-') ?
            {width: val.slice(1), dir: false} :
            {width: val, dir: true};
    }
    throw new Error(typeof val);
};
