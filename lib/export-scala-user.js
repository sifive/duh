'use strict';

const parts = require('./export-scala-parts.js');

module.exports = props => {
    const comp = props.component;
    return `// USER editable file

${parts.header(comp)}

class L${comp.name} extends L${comp.name}Base
{

// User code here

}

class N${comp.name}Top extends N${comp.name}TopBase
{

// User code here

}

object N${comp.name}Top {
  N${comp.name}TopBase();

// User code here

}

class With${comp.name}Top extends With${comp.name}TopBase((site, here, up) => {

// User code here

})
`;
};
