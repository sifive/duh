'use strict';

module.exports = p => {
    const comp = p.component;
    return `import mill._
import mill.scalalib._
import ammonite.ops._

import $file.^.\`scala-wake\`.common, common._

trait ${comp.name}Base extends ScalaModule with WakeModule with CommonOptions
`;
};
