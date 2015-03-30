'use strict';

let Harvester = require('harvester'),
    Builder = require('builder'),
    Guard = require('guard'),
    Attacker = require('attacker'),
    Healer = require('healer');

exports.run = function() {
    for (var i in Game.creeps) {
        var creep = Game.creeps[i],
            r;
        if (creep.memory.role === 'harvester') {
            r = new Harvester(creep);
        } else if (creep.memory.role === 'builder') {
            r = new Builder(creep);
        } else if (creep.memory.role === 'guard') {
            r = new Guard(creep);
        } else if (creep.memory.role === 'attack') {
            r = new Attacker(creep);
        } else if (creep.memory.role === 'rangedGuard') {
            r = new Guard(creep);
        } else if (creep.memory.role === 'healer') {
            r = new Healer(creep);
        }

        if (r) {
            r.run();
        }
    }
};
