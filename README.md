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
      ports: <...>
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

## Bus interfaces

If component block has bus interfaces this mapping can be expressed here:

```js
{
  component: {
    busInterfaces: [<...>]
  }
}
```

Author can attempt to infer bus interface mapping by running:

```
duh infer [mycomp.json5]
```

:warning: user may need manual fixes after running inference.

## Memory regions

## Registers

## Parameter schema

## Clocks, Resets

# Export from duh

  * [Scala](doc/export-scala.md)
