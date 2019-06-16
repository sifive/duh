[![NPM version](https://img.shields.io/npm/v/duh.svg)](https://www.npmjs.org/package/duh)
[![Travis build Status](https://travis-ci.org/sifive/duh.svg?branch=master)](https://travis-ci.org/sifive/duh)

# Design ∪ Hardware

DUH (pronounced [**[dûx]**](https://upload.wikimedia.org/wikipedia/commons/0/08/Ru-%D0%B4%D1%83%D1%85.ogg)) is a suite of tools for packaging reusable hardware components and
designs. DUH enables the generation of JSON5 [duh-documents][/doc] for
describing these components, and also enables export from these documents
to output deliverables.

<!-- FIXME table of contents -->
<!-- FIXME link to duh-document repo -->

## Install

Make sure that you have `Node.js` v6..v11 installed by running:

```
node --version
```

On [[Installing Node.js via package manager](https://nodejs.org/en/download/package-manager/)]

Install `duh` tool suite.

```bash
npm i duh
```

And test installation with `duh --help`

## Quick start

The following base set of DUH tools can be used to generate a
[duh-document][ddoc] for hardware components and designs:

* Run `duh init` to create a base [duh-document][doc/].

* Run `duh-import-verilog-ports` to import an interface from Verilog RTL of the component -> [import](doc/import.md)

* Run `duh-portinf` to infer mappings of portgroups to standard bus
  definitions AXI, AHB, TileLink, etc.

* Run `duh-portbundler` to group ports, which are unassigned to a bus
  mapping, into structured bundles.

* Run `duh validate` to test whether a given document conforms to the
  [duh-document][doc/] structure.

The following base set of DUH tools can be used to generate outputs from a
valid [duh-document][doc/]:

* Run `duh-export-scala` to generate scala black box wrappers for the
  component.

## Further help

Further information:

* [block-ark](https://github.com/sifive/block-ark) for a walk-through
  example using the DUH suite on a standalone module to produce a valid
  [duh-document][doc/] that fully describes the mapping of ports to known
  bus definitions.

* the [duh-document][doc/] standard.

* [duhportinf][https://github.com/sifive/duhportinf] for the port
  inference DUH package that contains usage details of the `duh-portinf`
  and `duh-portbundler` tools.


## Other DUH packages:

* [duh-scala](https://github.com/sifive/duh-scala) -- Scala / Chisel export
* [duh-ipxact](https://github.com/sifive/duh-ipxact) -- IP-XACT import / export
* [duhportinf](https://github.com/sifive/duhportinf) -- Bus interfaces inference
* [duh-bus](https://github.com/sifive/duh-bus) -- DUH Bus Definitions
* [duh-schema](https://github.com/sifive/duh-schema) -- DUH document JSON schema
* [duh-core](https://github.com/sifive/duh-core) -- DUH core library
