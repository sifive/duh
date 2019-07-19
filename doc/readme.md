## duh-documents

DUH operates with JSON5 "duh-documents" that descibe hardware blocks.  The
format of duh-documents is inspired by IP-XACT semantics.  Duh-documents
can describe [Components](component.md) or [Designs](design.md).

## component

Component duh-documents collects information about a single hardware block
without expressing internal structure or hierarchy and contains the
following:

  * name, version
  * top level [ports](component.md#ports)
  * [bus interfaces](component.md#bus-interfaces)
  * [memory regions](component.md#memory-regions)
  * [registers](component.md#registers)
  * [parameter schema](component.md#parameter-schema)
  * clocks, resets
  * block generation flow
  * references to implementation, documentation, tests

See more: [components](component.md)

## design

Design duh-documents captures hierarchy of the block composed from one or
more Components or Designs, and contains following:

  * name, version
  * dependencies
  * instances
  * parameter values
  * connections
  * design generation flow

See more: [designs](design.md)

## bus definition



See [duh-bus](https://github.com/sifive/duh-bus) collection of Bus definitions in DUH format.
