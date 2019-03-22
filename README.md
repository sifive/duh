# Design ∪ Hardware

DUH is a suite of tools for packaging reusable hardware components and
designs. DUH enables the generation of JSON5 [duh-documents][ddoc] for
describing these components, and also enables export from these documents
to output deliverables.

<!-- FIXME table of contents -->
<!-- FIXME link to duh-document repo -->

## Install

First ensure Node Package Manager (`npm`) version 10 is installed or
[get npm](https://www.npmjs.com/get-npm).

#### Globally install 

Install globally with `-g`

```console
npm i -g github:sifive/duh
```

And test installation with `duh --help`

#### Locally install to a project

Install locally with

```console
npm i github:sifive/duh
```

Then configure your shell to search for local installs of `npm` packages by
adding the following to your `.profile`,`.bashrc`, etc:

```sh
alias npm-exec='PATH=$(npm bin):$PATH'
```

Test installation with `npm-exec duh --help`

## Quick start

The following base set of DUH tools can be used to generate a
[duh-document][ddoc] for hardware components and designs:

* Run `duh init` to create a base [duh-document][ddoc].

* Run `duh-import-verilog-ports` to import a port list from a
  ([pre-preprocessed](#preprocess-verilog)) verilog top-level module.

* Run `duh-portinf` to infer mappings of portgroups to standard bus
  definitions (AXI, AHB, TileLink, etc).

* Run `duh-portbundler` to group ports, which are unassigned to a bus
  mapping, into structured bundles.

* Run `duh validate` to test whether a given document conforms to the
  [duh-document][ddoc] standard.

The following base set of DUH tools can be used to generate outputs from a
valid [duh-document][ddoc]:

* Run `duh-export-scala` to generate scala black box wrappers for the
  component.

<a name="preprocess-verilog"></a>
#### Preprocess verilog top-level module

To run a verilog preprocessor on the top-level module, use:

```console
verilator -E -Irtl mytop.v > mytop.preproc.v
```

or

```console
vppreproc -Irtl mytop.v > mytop.preproc.v
```

## Further help

Further information:

* [block-ark](https://github.com/sifive/block-ark) for a walk-through
  example using the DUH suite on a standalone module to produce a valid
  [duh-document][ddoc] that fully describes the mapping of ports to known
  bus definitions.

* the [duh-document][ddoc] standard.

* [duhportinf](https://github.com/sifive/duhportinf) for the port
  inference DUH package that contains usage details of the `duh-portinf`
  and `duh-portbundler` tools.

[ddoc]: doc/
