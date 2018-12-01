'use strict';

const id = {
    type: 'string',
    minLength: 3,
    maxLength: 256,
    pattern: '^[a-zA-Z][a-zA-Z0-9_]*$'
};

const uint = {
    type: 'integer',
    minimum: 0
};

const access = {
    enum: [
        'read-write',
        'read-only',
        'write-only',
        'read-writeOnce',
        'writeOnce'
    ]
};

const portMap = {
    type: 'object',
    properties: {
        logicalPort: {
            type: 'object',
            required: ['name'],
            properties: {
                name: id
            }
        },
        physicalPort: {
            type: 'object',
            required: ['name'],
            properties: {
                name: id
            }
        },
        logicalTieOff: {
            type: 'integer',
            minimum: 0
        }
    },
    oneOf: [{
        required: ['logicalPort', 'physicalPort']
    }, {
        required: ['logicalPort', 'logicalTieOff']
    }]
};

const busInterfaces = {
    type: 'array',
    items: {
        type: 'object',
        required: ['name', 'interfaceMode', 'busType', 'abstractionTypes'],
        properties: {
            name: id,
            interfaceMode: {enum: ['master', 'slave']},
            busType: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: id
                }
            },
            abstractionTypes: {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['viewRef'],
                    properties: {
                        viewRef: id,
                        portMaps: {
                            type: 'array',
                            items: portMap
                        }
                    }
                }
            }
        }
    }
};

const ports = {
    type: 'array',
    items: {
        type: 'object',
        required: ['name', 'wire'],
        properties: {
            name: id,
            wire: {
                type: 'object',
                required: ['direction', 'width'],
                properties: {
                    direction: {enum: ['in', 'out']},
                    width: {
                        oneOf: [{
                            type: 'integer',
                            minimum: 1
                            // maximum: 65536 // FIXME unbound wire width
                        }, {
                            type: 'string'
                        }]
                    }
                }
            }
        }
    }
};

const component = {
    type: 'object',
    required: ['vendor', 'library', 'name', 'version', 'model'],
    properties: {
        vendor: id,
        library: id,
        name: id,
        version: {type: 'string'}, // FIXME semver?
        busInterfaces: busInterfaces,
        model: {
            type: 'object',
            required: ['ports'],
            properties: {
                ports: ports
            }
        },
        addressSpaces: {
            type: 'array',
            items: {
                type: 'object',
                required: ['name', 'range', 'width'],
                properties: {
                    name: id,
                    range: uint,
                    width: uint
                }
            }
        },
        memoryMaps: {
            type: 'array',
            items: {
                type: 'object',
                required: ['name', 'addressBlocks'],
                properties: {
                    name: id,
                    addressBlocks: {
                        type: 'array',
                        items: {
                            type: 'object',
                            required: ['name', 'baseAddress', 'range', 'width'],
                            properties: {
                                name: id,
                                baseAddress: uint,
                                range: uint,
                                width: uint,
                                usage: {enum: ['memory', 'register']},
                                volatile: {type: 'boolean'},
                                access: access,
                                registers: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        required: ['name', 'addressOffset', 'size'],
                                        properties: {
                                            name: id,
                                            addressOffset: uint,
                                            size: uint,
                                            access: access,
                                            displayName: {type: 'string'},
                                            description: {type: 'string'},
                                            fields: {
                                                type: 'array',
                                                items: {
                                                    type: 'object',
                                                    required: ['name', 'bitOffset', 'bitWidth'],
                                                    properties: {
                                                        name: id,
                                                        bitOffset: uint,
                                                        bitWidth: uint,
                                                        displayName: {type: 'string'},
                                                        description: {type: 'string'}
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        componentGenerators: {type: 'array'},
        fileSets: {
            type: 'array',
            required: ['name', 'files'],
            properties: {
                name: id,
                files: {
                    type: 'array',
                    items: {
                        type: 'string'
                    }
                }
            }
        },
        parameters: {
            type: 'array'
        }
    }
};

module.exports = component;
