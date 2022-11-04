<p align="center"><img src="docs/assets/logo.svg"/></p>

[![NPM version](https://img.shields.io/npm/v/duh.svg)](https://www.npmjs.org/package/duh)
[![Actions Status](https://github.com/sifive/duh/workflows/Tests/badge.svg)](https://github.com/sifive/duh/actions)
[![Coverage Status](https://coveralls.io/repos/github/sifive/duh/badge.svg?branch=master)](https://coveralls.io/github/sifive/duh?branch=master)

# Design ∪ Hardware

DUH ("Spirit" in most slavic languages. pronounced [**/dûx/**](https://upload.wikimedia.org/wikipedia/commons/0/08/Ru-%D0%B4%D1%83%D1%85.ogg), with the final consonant of *loch* or *Bach*) is a suite of tools for packaging reusable hardware components and
designs. DUH enables the generation of JSON5 ([duh documents](docs/)) for
describing these components, and also enables export from these documents
to output deliverables.

## Install

Check that you have `Node.js` version (12, 14, 16) installed by running:

```
node --version
```

On [Installing Node.js via package manager](https://nodejs.org/en/download/package-manager/)

Install `duh` tool suite.

```bash
npm i -g duh
```

You might need to add `./node_modules/.bin/` to your PATH

In Bash:

```sh
export PATH=./node_modules/.bin:$PATH
```

And test installation with `duh --help`

## Quick start

Base set of DUH tools to author [duh documents](docs/):

* Create
  - Run `duh init` to create a base document.

* [Import](docs/import.md)
  - SystemVerilog: Run `duh duh-import-verilog-ports` to import an interface from Verilog RTL of the component
  - IPXACT: [duh-ipxact](https://github.com/sifive/duh-ipxact)

* Infer
  - Run `duh-portinf` to infer mappings of portgroups to standard bus
  definitions AXI, AHB, TileLink, etc.
  - Run `duh-portbundler` to group ports, which are unassigned to a bus
  mapping, into structured bundles.

* [Validate](docs/validation.md)
  - Run `duh validate` to test whether a given document conforms to the
  DUH document structure.

* [Export](docs/export.md)
  - Run `duh-export-scala` to generate scala black box wrappers for the
  component.
  - IPXACT: [duh-ipxact](https://github.com/sifive/duh-ipxact)

## DUH toolbox

* [duh-scala](https://github.com/sifive/duh-scala) -- Scala / Chisel export
* [duh-ipxact](https://github.com/sifive/duh-ipxact) -- IP-XACT import / export
* [duh-systemrdl](https://github.com/sifive/duh-systemrdl) -- SystemRDL import / export
* [duhportinf](https://github.com/sifive/duhportinf) -- Bus interfaces inference
* [duh-bus](https://github.com/sifive/duh-bus) -- DUH Bus Definitions
* [duh-schema](https://github.com/sifive/duh-schema) -- DUH document JSON schema
* [duh-core](https://github.com/sifive/duh-core) -- DUH core library
* [duh-verilog](https://github.com/sifive/duh-verilog) -- Verilog generator from DUH document
* [duh-svd](https://github.com/sifive/duh-svd) -- DUH to SVD converter

## Example of DUH documents

* [block-ark](https://github.com/sifive/block-ark) for a walk-through
  example using the DUH suite on a standalone module to produce a valid
  [duh-document](docs/) that fully describes the mapping of ports to known
  bus definitions.
