'use strict';

exports.master = p => `IntSourceNode(
    IntSourcePortSimple(
      num = ${p.abstractionTypes[0].portMaps.length}
    )
  )
`;
/* ${JSON.stringify(p, null, 4)} */

exports.slave = p => `IntSourceNode(
    IntSourcePortSimple(
      num = ${p.abstractionTypes[0].portMaps.length}
    )
  )
`;
/* ${JSON.stringify(p, null, 4)} */

exports.busDef = [];
