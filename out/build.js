"use strict";

var harvest = require("harvest");

function handleTarget(creep, spawn, target, isRepair) {
    if (creep.energy === 0) {
        creep.moveTo(spawn);
        if (spawn.energy > 200) {
            spawn.transferEnergy(creep);
        }
    } else {
        creep.moveTo(target);
        if (isRepair) {
            creep.repair(target);
        } else {
            creep.build(target);
        }
    }
}

module.exports = exports = function (creep) {
    var spawn = Game.spawns[creep.memory.spawnName];
    var buildTarget = spawn.pos.findClosest(Game.CONSTRUCTION_SITES, {
        filter: function (s) {
            return s.my;
        }
    });
    var repairTarget = spawn.pos.findClosest(Game.MY_STRUCTURES, {
        filter: function (s) {
            return s.hits < s.hitsMax - 20;
        }
    });

    if (buildTarget) {
        handleTarget(creep, spawn, buildTarget, false);
    } else if (repairTarget) {
        handleTarget(creep, spawn, repairTarget, true);
    } else {
        harvest(creep);
    }
};