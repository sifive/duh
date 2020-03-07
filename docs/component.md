# Component document

Component document collects information about a single hardware block
without expressing internal structure or hierarchy.
Component document expressing following aspects:

  * name, version
  * top level ports
  * parameter schema
  * bus interfaces
  * memory regions
  * registers
  * clocks, resets
  * block generation flow
  * references to implementation, documentation, tests

### Ports

The information about the component ports has to be captured here:

```js
{
  component: {
    model: {
      ports: {
        clk: 1,     // <- input clk
        wdata: 32,  // <- input [31:0] wdata
        rdata: -64, // <- output [31:0] rdata
        ...
      }
    }
  }
}

```

### Bus interfaces

If component block has bus interfaces this mapping can be expressed here:

```js
{
  component: {
    ...
    busInterfaces: [{
      name: 'ctrl',
      interfaceMode: 'slave',
      busType: {vendor: 'sifive.com', library: 'AMBA', name: 'AXI4', version: 'r0p0_0'},
      abstractionTypes: [{
        viewRef: 'RTLview',
        portMaps: {
          AWREADY: 't_ctrl_awready', // +
          AWVALID: 't_ctrl_awvalid', // +
          AWADDR:  't_ctrl_awaddr', // + width
          ...
        },
      }],

    },
    ...
    ]
  }
}
```

## Memory regions

```js
{
  component: {
    ...
    memoryMaps: [{
      ...
    }]
    ...      
  }
}

```

## Registers



```js
{
  component: {
    ...
    memoryMaps: [{
      name: 'CSR',
      addressBlocks: [{
        name: 'CSR0',
        baseAddress: 0,
        range: 1024, width: 32,
        usage: 'register',
        volatile: false, access: 'read-write',
        registers: [{
          name: 'ODATA',
          addressOffset: 0, size: 32,
          displayName: 'Output Data Register',
          fields: [{
            name: 'data', bitOffset: 0, bitWidth: 5
          }, {
            name: 'mask', bitOffset: 8, bitWidth: 8
          }]
        },
        ...
        ]
      },
      ...
      ]
    }]
    ...
  }
}
```



## Parameter schema

Component with parameters has to provide [JSON Schema](https://json-schema.org/)
description for these parameters.

```js
{
  component: {
    ...
    pSchama: {
      ...
    },
    ...
  }
}

```

## Clocks, Resets
