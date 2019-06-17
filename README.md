<img src="assets/logo.svg" align="middle">

[![NPM version](https://img.shields.io/npm/v/duh.svg)](https://www.npmjs.org/package/duh)
[![Travis build Status](https://travis-ci.org/sifive/duh.svg?branch=master)](https://travis-ci.org/sifive/duh)

# Design ∪ Hardware

DUH (pronounced [**[dûx]**](https://upload.wikimedia.org/wikipedia/commons/0/08/Ru-%D0%B4%D1%83%D1%85.ogg)) is a suite of tools for packaging reusable hardware components and
designs. DUH enables the generation of JSON5 ([duh documents](doc/)) for
describing these components, and also enables export from these documents
to output deliverables.

## Install

Check that you have `Node.js` version (6 - 11) installed by running:

```
node --version
```

On [Installing Node.js via package manager](https://nodejs.org/en/download/package-manager/)

Install `duh` tool suite.

```bash
npm i duh
```

And test installation with `duh --help`

## Quick start

Base set of DUH tools to author [duh documents](doc/):

* Create
  - Run `duh init` to create a base document.

* [Import](doc/import.md)
  - Run `duh-import-verilog-ports` to import an interface from Verilog RTL of the component

* Infer
  - Run `duh-portinf` to infer mappings of portgroups to standard bus
  definitions AXI, AHB, TileLink, etc.
  - Run `duh-portbundler` to group ports, which are unassigned to a bus
  mapping, into structured bundles.

* [Validate](doc/validation.md)
  - Run `duh validate` to test whether a given document conforms to the
  DUH document structure.

* [Export](doc/export.md)
  - Run `duh-export-scala` to generate scala black box wrappers for the
  component.

## Other DUH packages:

* [duh-scala](https://github.com/sifive/duh-scala) -- Scala / Chisel export
* [duh-ipxact](https://github.com/sifive/duh-ipxact) -- IP-XACT import / export
* [duhportinf](https://github.com/sifive/duhportinf) -- Bus interfaces inference
* [duh-bus](https://github.com/sifive/duh-bus) -- DUH Bus Definitions
* [duh-schema](https://github.com/sifive/duh-schema) -- DUH document JSON schema
* [duh-core](https://github.com/sifive/duh-core) -- DUH core library

## Example of DUH documents

* [block-ark](https://github.com/sifive/block-ark) for a walk-through
  example using the DUH suite on a standalone module to produce a valid
  [duh-document](doc/) that fully describes the mapping of ports to known
  bus definitions.
