module.exports = exports = function(creep) {
    var spawn = Game.spawns[creep.memory.spawnName];
    var target = creep.pos.findClosest(Game.MY_CREEPS, {
        filter: function(object) {
            return object.hits < object.hitsMax;
        }
    });

    if (target) {
        if (creep.pos.isNearTo(target)) {
            creep.heal(target);
        } else if (creep.pos.inRangeTo(target, 3)) {
            creep.rangedHeal(target);
        } else {
            creep.moveTo(target);
        }
    } else {
        var rallyPoint = spawn.pos;
        if (Game.flags.BoushleyRally) {
            rallyPoint = Game.flags.BoushleyRally.pos;
        }

        creep.moveTo(rallyPoint);
    }

};
