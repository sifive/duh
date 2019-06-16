## Table of Contents

- [Verilog RTL import](#verilogrtlimport)
  * [Verilog Preprocessor](#verilogpreprocessor)
- [IP-XACT import](#ip-xactimport)
- [SystemRDL import](#systemrdlimport)

## Verilog RTL import

Information about component interface can be imported from Verilog RTL source
using `duh-import-verilog-ports` tool.

```sh
cat mytop.v | duh-import-verilog-ports mytop.json5
```

Import tool will look for the Verilog module specified in `mytop.json5` as the `component.name`.

### Verilog Preprocessor

If your Verilog has any tick-define constructs in it,
you should run Verilog preprocessor before parsing it.
The path to all include files and all defines should be provided.
Verilator (with option `-E`) can be used to preprocess Verilog.

```sh
verilator -E <OPTIONS> mytop.v | duh-import-verilog-ports mytop.json5
```

Verilator options to include and define:

```sh
 -D<var>[=<value>]          Set preprocessor define
 +define+<var>=<value>      Set preprocessor define
 -U<var>                    Undefine preprocessor define
 -FI <file>                 Force include of a file
 -I<dir>                    Directory to search for includes
 +incdir+<dir>              Directory to search for includes
--relative-includes         Resolve includes relative to current file
```

For more Verilator options look here: https://www.veripool.org/projects/verilator/wiki/Manual-verilator

## IP-XACT import

## SystemRDL import
