## Verilog RTL import

Information about componet ports can be imported from Verilog RTL of block using the following procedure.

## Verilog Preprocessor

If your Verilog has any tick-define constructs in it, you should run Verilog preprocessor before parsing it.
The path to all include files and all defines should be provided.
Verilator (with option -E) can be used to preprocess Verilog.

Example:

```bash
verilator -E -I<includePath> mytop.v > mytop.preproc.v
```

For more Verilator options look here: https://www.veripool.org/projects/verilator/wiki/Manual-verilator

## Verilog Parser

Run `duh-import-verilog-ports` to import a port list from a (pre-preprocessed) verilog top-level module.

```bash
duh-import-verilog-ports
```
