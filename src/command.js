'use strict';

let harvest = require('harvest'),
    build = require('build'),
    Guard = require('roles/guard'),
    attack = require('attack'),
    heal = require('healer');

exports.run = function() {
    for (var i in Game.creeps) {
        var creep = Game.creeps[i];
        if (creep.memory.role === 'harvester') {
            harvest(creep);
        } else if (creep.memory.role === 'builder') {
            build(creep);
        } else if (creep.memory.role === 'guard') {
            let r = new Guard(creep);
            r.run();
        } else if (creep.memory.role === 'attack') {
            attack(creep);
        } else if (creep.memory.role === 'rangedGuard') {
            let r = new Guard(creep);
            r.run();
        } else if (creep.memory.role === 'healer') {
            heal(creep);
        }
    }
};
