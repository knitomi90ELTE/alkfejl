// config/waterline.js

// ORM - adapterek
var memoryAdapter = require('sails-memory');
var diskAdapter = require('sails-disk');

// ORM - konfiguráció
var config = {
    adapters: {
        memory:     memoryAdapter,
        disk:       diskAdapter,
    },
    connections: {
        default: {
            adapter: 'disk',
        },
        memory: {
            adapter: 'memory'
        },
        disk: {
            adapter: 'disk'
        },
    },
    defaults: {
        migrate: 'alter'
    },
};

module.exports = config;

