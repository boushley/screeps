'use strict';

let Harvester = require('harvester'),
    Builder = require('builder'),
    Guard = require('guard'),
    attack = require('attack'),
    Healer = require('healer');

exports.run = function() {
    for (var i in Game.creeps) {
        var creep = Game.creeps[i];
        if (creep.memory.role === 'harvester') {
            let r = new Harvester(creep);
            r.run();
        } else if (creep.memory.role === 'builder') {
            let r = new Builder(creep);
            r.run();
        } else if (creep.memory.role === 'guard') {
            let r = new Guard(creep);
            r.run();
        } else if (creep.memory.role === 'attack') {
            attack(creep);
        } else if (creep.memory.role === 'rangedGuard') {
            let r = new Guard(creep);
            r.run();
        } else if (creep.memory.role === 'healer') {
            let r = new Healer(creep);
            r.run();
        }
    }
};
