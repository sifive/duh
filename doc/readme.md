DUH operates with JSON5 documents describing Hardware Block.
Documents using IP-XACT semantics where it is applicable.
Document collects information about some hardware block
and can be used without access to the the implementation files.
Document can describe [Component](component.md) or [Design](design.md).

## Component document

Component document collects information about a single hardware block
without expressing internal structure or hierarchy.
[Component](component.md) document expressing following aspects:

  * name, version
  * top level [ports](component.md#ports)
  * [bus interfaces](component.md#bus-interfaces)
  * [memory regions](component.md#memory-regions)
  * [registers](component.md#registers)
  * [parameter schema](component.md#parameter-schema)
  * clocks, resets
  * block generation flow
  * references to implementation, documentation, tests

See more: [component](component.md)

## Design document

Design document captures hierarchy of the block composed from one or more
Components or Designs; and contains following details:

  * name, version
  * dependencies
  * instances
  * parameter schema
  * connections
  * design generation flow

See more: [design](design.md)
