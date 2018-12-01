'use strict';

module.exports = cb => {
    const enter = cb.enter || (() => {});
    const leave = cb.leave || (() => {});
    const leaf  = cb.leaf  || (() => {});

    const rec = path => node => {
        enter(node, path);
        if (typeof node === 'object') {
            Object.keys(node).map(key => {
                rec(path.concat(key))(node[key]);
            });
        } else {
            leaf(node, path);
        }
        leave(node, path);
    };

    return rec([]);
};
