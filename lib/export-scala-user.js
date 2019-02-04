'use strict';

const parts = require('./export-scala-parts.js');

module.exports = props => {
  const comp = props.component;
  return `// USER editable file

${parts.header(comp)}

class L${comp.name}(c: ${comp.name}Params)(implicit p: Parameters) extends L${comp.name}Base(c)(p)
{

// User code here

}

class N${comp.name}Top(c: N${comp.name}TopParams)(implicit p: Parameters) extends N${comp.name}TopBase(c)(p)
{

// User code here

}

object N${comp.name}Top {
  def attach(c: N${comp.name}TopParams)(bap: BlockAttachParams): N${comp.name}Top = {
    val ${comp.name} = N${comp.name}TopBase.attach(c)(bap)

    // User code here

    ${comp.name}
  }
}

class With${comp.name}Top extends Config(
  new With${comp.name}TopBase()

    // User code here
)
`;
};
