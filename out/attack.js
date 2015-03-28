"use strict";
module.exports = exports = function (creep) {
    var spawn = Game.spawns[creep.memory.spawnName];
    var target = spawn.pos.findClosest(Game.HOSTILE_CREEPS, {
        filter: function filter(object) {
            var hasAttack = object.getActiveBodyparts(Game.ATTACK) === 0,
                hasRangedAttack = object.getActiveBodyparts(Game.RANGED_ATTACK) === 0;
            return !hasAttack && !hasRangedAttack;
        }
    });
    console.log("attacking:", target);
    if (target) {
        creep.moveTo(target);
        creep.attack(target);
    }
};