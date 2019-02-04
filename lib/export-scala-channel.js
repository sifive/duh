'use strict';

module.exports = {
  master: {
    adapter: () => '// channel master adapter',
    params: () => '// channel master params',
    node: () => '// channel master node',
    attach: () => '// channel master attach'
  },
  slave: {
    adapter: () => '// channel slave adapter',
    params: () => '// channel slave params',
    node: () => '// channel slave node',
    attach: () => '// channel slave attach'
  },
  busDef: {
    vld: 1,
    rdy: -1,
    dat: 'WIDTH'
  }
};
