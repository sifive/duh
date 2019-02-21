# Design ∪ Hardware

Library and CLI tool for packaging of reusable chip design components and designs.
DUH operates with JSON5 documents describing Hardware Block.
Inspired by IP-XACT and SytemRDL.

Document collects information about some hardware block
and can be used without access to the the implementation files.
Document can describe [Component](component.md) or [Design](design.md).

## Install

DUH tools require [NodeJS](https://nodejs.org) of version 8+ to operate properly.

you can check NodeJS version by running:

```
node --version
```

If you already have NodeJS installed you can skip next section.

### Install NodeJS

NodeJS of specific version can be installed using [Node Version Manager](https://github.com/creationix/nvm)

Install NVM:

```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
source ~/.bashrc
```

Install NodeJS version 10.x.x using NVM

```
nvm i 10
```

### Install DUH tools

Configure you PATH to find DUH tools

```
export PATH=./node_modules/.bin:$PATH
```

Install DUH tools using NodeJS

```sh
cd <workspace>
npm i github:sifive/duh
```

Getting DUH commands and options

```sh
cd <workspace>
duh --help
```

## Authoring the document

In order to be useful, the document has to capture a sufficient amount
of details about the Hardware block and all information has to be correct.

Document stored in [JSON5](https://json5.org/) file format and can be edited
in any text editor at any time.

## Creating new document

You can create new document manually or by running CLI questionnaire.

Run the following command and answer the questions:

```
cd <workspace>
duh init [mycomp.json5]
```

## Document validation

Every document has to adhere to specific [JSON Schema](https://json-schema.org/)
described here:
[Schema](https://github.com/sifive/duh/blob/master/lib/schema-component.js)

After making changes author should run the document validation process
by the following command:

```
cd <workspace>
duh val [mycomp.json]
```

See more about Document validation here: [validation](doc/validation.md)

## Component document

[Component](component.md) document collects information about a single hardware
block without expressing internal structure or hierarchy.

### Port import

Information about ports can be entered manually or imported
from top level RTL Verilog file by running the following command:

```
cd <workspace>
verilator -E -Irtl rtl/mycomp.v | duh-import-verilog-ports [mycomp.json5]
```

or

```
cd <workspace>
vppreproc -Irtl rtl/mycomp.v | duh-import-verilog-ports [mycomp.json5]
```

```sh
duh-import-verilog-ports --help

Options:
  --output, -o  result file
  --version     Show version number                                    [boolean]
  --help        Show help                                              [boolean]
```

:warning: imported ports may require some manual fixes.

See more about import into DUH document here: [import](doc/import.md)

## Bus interfaces inference

Author can infer bus interface mappings by running:

```
cd <workspace>
duh-portinf -o mycomp-busprop.json mycomp.json5
```

This will generate candidate bus interface mappings for select groups of
ports with high quality matches.

## Export

### Scala

To export Scala from DUH document run the following command:

```
cd <workspace>
duh-export-scala [mycomp.json5]
```
