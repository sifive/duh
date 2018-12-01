'use strict';

exports.master = () => `IntSourceNode(
    IntSourcePortSimple(
      num = 3,
      resources = device.int
    )
  )
`;

exports.slave = () => `IntSourceNode(
    IntSourcePortSimple(
      num = 3,
      resources = device.int
    )
  )
`;

exports.busDef = {
    INT: [1, 1, 1, 1]
};
