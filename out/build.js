"use strict";

var harvest = require("harvest");

module.exports = exports = function (creep) {
    var spawn = Game.spawns[creep.memory.spawnName];
    var target = spawn.pos.findClosest(Game.CONSTRUCTION_SITES, {
        filter: function filter(site) {
            return site.my;
        }
    });

    if (target) {
        if (creep.energy === 0) {
            creep.moveTo(spawn);
            spawn.transferEnergy(creep);
        } else {
            creep.moveTo(target);
            creep.build(target);
        }
    } else {
        harvest(creep);
    }
};