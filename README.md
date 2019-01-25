# Design ∪ Hardware

Library and CLI tool for packaging of reusable chip design components and designs.

DUH operates with JSON5 documents describing Hardware Block.
Documents using IP-XACT semantics where it is applicable.
Document collects information about some hardware block
and can be used without access to the the implementation files.
Document can describe **Component** or **Design**.

## Component document

Component document collects information about a single hardware block
without expressing internal structure or hierarchy.
Component document expressing following aspects:

  * name, version
  * top level ports
  * parameter schema
  * bus interfaces
  * memory regions
  * registers
  * clocks, resets
  * block generation flow
  * references to implementation, documentation, tests

## Design document

Design document captures hierarchy of the block composed from one or more
Components or Designs; and contains following details:

  * name, version
  * dependencies
  * instances
  * parameter schema
  * connections
  * design generation flow

# Authoring the document

In order to be useful, the document has to capture a sufficient amount
of details about the Hardware block and all information has to be correct.

Document stored in [JSON5](https://json5.org/) file format and can be edited
in any text editor at any time.

## Creating new document

You can create new document manually or by running CLI questionnaire.

Run the following command and answer the questions:

```
duh init [mycomp.json5]
```

## Document validation

Every document has to adhere to specific [JSON Schema](https://json-schema.org/) described here:
[Schema](https://github.com/sifive/duh/blob/master/lib/schema-component.js)

After making changes author should run the document validation process
by the following command:

```
duh val [mycomp.json]
```

See more about Document validation here: [validation](doc/validation.md)

## Include RTL

Specify path to the RTL Verilog files in fileSets section:

```js
{
  component: {
    ...
    fileSets: {
      VerilogFiles: [
        'rtl/mycomp.v',
        ...
      ]
    }
  }
}
```

?? What about Includes ??

## Component ports

The information about the component ports has to be captured here:

```js
{
  component: {
    model: {
      ports: {
        clk: 1,     // <- input clk
        wdata: 32,  // <- input [31:0] wdata
        rdata: -64, // <- output [31:0] rdata
        ...
      }
    }
  }
}

```

Information about ports can be entered manually or imported
from top level RTL Verilog file by running the following command:

```
verilator -E -Irtl rtl/mycomp.v | duh-import-verilog-ports [mycomp.json5]
```

or

```
vppreproc -Irtl rtl/mycomp.v | duh-import-verilog-ports [mycomp.json5]
```

:warning: imported ports may require some manual fixes.

See more about import into DUH document here: [import](doc/import.md)

## Bus interfaces

If component block has bus interfaces this mapping can be expressed here:

```js
{
  component: {
    ...
    busInterfaces: [{
      name: 'ctrl',
      interfaceMode: 'slave',
      busType: {vendor: 'sifive.com', library: 'AMBA', name: 'AXI4', version: 'r0p0_0'},
      abstractionTypes: [{
        viewRef: 'RTLview',
        portMaps: {
          AWREADY: 't_ctrl_awready', // +
          AWVALID: 't_ctrl_awvalid', // +
          AWADDR:  't_ctrl_awaddr', // + width
          ...
        },
      }],

    },
    ...
    ]
  }
}
```

Author can attempt to infer bus interface mapping by running:

```
duh infer [mycomp.json5]
```

:warning: user may need manual fixes after running inference.

See more about Inference inside DUH document here: [inference](doc/inference.md)

## Memory regions

```js
{
  component: {
    ...
    memoryMaps: [{
      ...
    }]
    ...      
  }
}

```

## Registers

```js
{
  component: {
    ...
    memoryMaps: [{
      name: 'CSR' // <- name of the register block
      ...
    }]
    ...
  }
}
```

## Parameter schema

Component with parameters has to provide [JSON Schema](https://json-schema.org/)
description for these parameters.

```js
{
  component: {
    ...
    pSchama: {
      ...
    },
    ...
  }
}

```

## Clocks, Resets

# Export from DUH

DUH document can be exported to several formats: [export](doc/export.md)
