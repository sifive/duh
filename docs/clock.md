# DUH clock

## Rationale

DUH documents capture integration intent.
Clock generation and distribution is part of integration.

## component → bus interface

### Rules:

* Every port of component MUST be mapped to one or more **bus interfaces**
* Standard bus interface have reference to **bus definition**
* Bundle is the structured collection ports
* All ports mapped to the same bus interface MUST belong to the **clock domain** of this bus interface.
* Special case of bus interface may have only clock port

### Open questions:

* Internal clocks that do not manifest themselves via ports are not important for integration?

## component → props

### Rules:

* clock can be referenced by referencing specific **bus interface**
* clock can have **own constraint** `{freq: 500e6}`
* clock can **depend** on other clock
* number -- specific divider ratio. example: 2
* set -- specifc possibilities. example [2, 4, 8]
* range -- fractional ratio. examples: [2..] (1..] [2..10)

## design → connections

* When IP blocks get instantiated and connected in DUH design document
* All clocks from child instances will be connected to the new set of **phantom clocks**
* Additional **dependencies** may be defined between phantom clocks
* Additional **clocks** can be created to drive one or more existing clocks
* Optional **dividers** can be inserted
* Driven clocks will disappear
* Every time clock property assigned; clock, connection, dependency created -- the system has to check consistency of the graph and produce an error otherwise.
