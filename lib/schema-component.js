'use strict';

const id = {
    type: 'string',
    minLength: 3,
    maxLength: 256,
    pattern: '^[a-zA-Z][a-zA-Z0-9_]*$'
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
                            items: {
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
                            }
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
