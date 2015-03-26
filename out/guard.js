module.exports = exports = function(creep) {
    var target = creep.pos.findClosest(Game.HOSTILE_CREEPS, {
        filter: function(object) {
            return object.pos.inRangeTo(Game.spawns.Spawn1.pos, 3);
        }
    });

    if(target) {
        creep.moveTo(target);
        creep.attack(target);
    }
};
