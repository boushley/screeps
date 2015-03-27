"use strict";

module.exports = exports = function (creep) {
    var spawn = Game.spawns[creep.memory.spawnName];
    var target = creep.pos.findClosest(Game.HOSTILE_CREEPS, {
        filter: function filter(object) {
            return object.pos.inRangeTo(spawn.pos, 12);
        }
    });

    if (target) {
        if (creep.getActiveBodyparts(Game.RANGED_ATTACK) > 0) {
            if (target.pos.inRangeTo(creep.pos, 3)) {
                creep.rangedAttack(target);
            } else {
                creep.moveTo(target);
            }
        } else {
            creep.moveTo(target);
            creep.attack(target);
        }
    } else {
        var rallyPoint = spawn.pos;
        if (Game.flags.BoushleyRally) {
            rallyPoint = Game.flags.BoushleyRally.pos;
        }

        creep.moveTo(rallyPoint);
    }
};