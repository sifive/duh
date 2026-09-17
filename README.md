<p align="center"><img src="docs/assets/logo.svg"/></p>

[![NPM version](https://img.shields.io/npm/v/duh.svg)](https://www.npmjs.org/package/duh)
[![Actions Status](https://github.com/sifive/duh/workflows/Tests/badge.svg)](https://github.com/sifive/duh/actions)

# Design ∪ Hardware

DUH ("Spirit" in most Slavic languages, pronounced [**/dûx/**](https://upload.wikimedia.org/wikipedia/commons/0/08/Ru-%D0%B4%D1%83%D1%85.ogg), with the final consonant of *loch* or *Bach*) is a suite of tools for packaging reusable hardware components and
designs. DUH enables the generation of JSON5 ([duh documents](docs/readme.md)) for
describing these components, and also enables export from these documents
to output deliverables.

## Install

`duh` requires `Node.js` (versions 22, 24, 26). Check your version:

```
node --version
```

See [Installing Node.js via package manager](https://nodejs.org/en/download/package-manager/).

Install `duh` tool suite globally:

```bash
npm i -g duh
```

Or install it locally and add `./node_modules/.bin/` to your PATH.

In Bash:

```sh
export PATH=./node_modules/.bin:$PATH
```

Test the installation with `duh --help`.

## Quick start

Base set of DUH tools to author [duh documents](docs/readme.md):

* Create
  - Run `duh init` to interactively scaffold a base document.

* [Import](docs/import.md)
  - Verilog: pipe RTL into `duh import verilog` to import the ports of
  the module whose name matches `component.name`.
  - Verilog (simple): `duh import verilog-simple` imports every pin
  found in the source, without module-name matching.
  - IPXACT: [duh-ipxact](https://github.com/sifive/duh-ipxact)

* Infer
  - Run `duh infer channels` to infer `channel` bus interfaces from ports
  named with `_vld` / `_rdy` / `_dat` suffixes.

* [Validate](docs/validation.md)
  - Run `duh validate` to test whether a given document conforms to the
  DUH document structure.

* [Export](docs/export.md)
  - Run `duh export bbx` to generate a Verilog black-box wrapper for
  the component.
  - Scala / Chisel: [duh-scala](https://github.com/sifive/duh-scala)
  - IPXACT: [duh-ipxact](https://github.com/sifive/duh-ipxact)

## Commands

All functionality lives under a single `duh` command:

```
duh init [filename]                        # scaffold a new document (interactive)
duh validate <filename>                    # validate against the DUH schema (alias: val)
duh get <value> [filename]                 # print a value at a path within the document

duh import verilog [filename] [-i rtl.v] [-o out.json5]         # ports of module == component.name
duh import verilog-simple [filename] [-i rtl.v] [-o out.json5]  # every pin, no module matching

duh infer channels [filename] [-o out.json5]   # channel bus interfaces from _vld/_rdy/_dat ports

duh export bbx [filename] [-o outdir]      # Verilog black-box wrapper
duh export header [filename] [-o outdir]   # C header file
```

When `filename` (the duh document) is omitted, commands default to
`<current-folder>.json5`. Verilog import reads RTL from `-i` / `--input`, or
from stdin when no file is given. `import` and `infer` write back to the input
document unless `-o` / `--output` is set (a warning is printed when overwriting
in place).

### Migration from 1.x

The standalone bins were merged into `duh` subcommands:

| 1.x                                | `duh` subcommand             |
| ---------------------------------- | ---------------------------- |
| `duh-import-verilog-ports`         | `duh import verilog`         |
| `duh-import-verilog-ports-simple`  | `duh import verilog-simple`  |
| `duh-infer-channels`               | `duh infer channels`         |
| `duh-export-verilog-bbx`           | `duh export bbx`             |

## DUH toolbox

* [duh-scala](https://github.com/sifive/duh-scala) -- Scala / Chisel export
* [duh-ipxact](https://github.com/sifive/duh-ipxact) -- IP-XACT import / export
* [duh-systemrdl](https://github.com/sifive/duh-systemrdl) -- SystemRDL import / export
* [duh-bus](https://github.com/sifive/duh-bus) -- DUH Bus Definitions
* [duh-schema](https://github.com/sifive/duh-schema) -- DUH document JSON schema
* [duh-core](https://github.com/sifive/duh-core) -- DUH core library
* [duh-verilog](https://github.com/sifive/duh-verilog) -- Verilog generator from DUH document
* [duh-svd](https://github.com/sifive/duh-svd) -- DUH to SVD converter

## Example of DUH documents

* [block-ark](https://github.com/sifive/block-ark) for a walk-through
  example using the DUH suite on a standalone module to produce a valid
  [duh-document](docs/readme.md) that fully describes the mapping of ports to known
  bus definitions.
