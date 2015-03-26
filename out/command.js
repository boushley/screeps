var harvest = require('harvest'),
    build = require('build'),
    guard = require('guard'),
    attack = require('attack');

exports.run = function() {
    for(var i in Game.creeps) {
        var creep = Game.creeps[i];
        if (creep.memory.role === 'harvester') {
            harvest(creep);
        } else if (creep.memory.role === 'builder') {
            build(creep);
        } else if (creep.memory.role === 'guard') {
            guard(creep);
        } else if (creep.memory.role === 'attack') {
            attack(creep);
        }
    }
};
