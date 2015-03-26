module.exports = exports = function(creep) {
    var target = creep.pos.findClosest(Game.HOSTILE_CREEPS, {
        filter: function(object) {
            return object.pos.inRangeTo(Game.spawns.Spawn1.pos, 3);
        }
    });

    if (target) {

        if (creep.getActiveBodyparts(Game.RANGED_ATTACK)) {
            if (target.pos.inRangeTo(creep.pos, 3)) {
                creep.rangedAttack(target);
            } else {
                creep.moveTo(target);
            }
        } else {
            creep.moveTo(target);
            creep.attack(target);
        }

    }
};
