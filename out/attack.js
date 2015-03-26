module.exports = exports = function(creep) {
    var target = creep.pos.findClosest(Game.HOSTILE_CREEPS, {
        filter: function(object) {
            var hasAttack = object.getActiveBodyparts(Game.ATTACK) === 0,
                hasRangedAttack = object.getActiveBodyparts(Game.RANGED_ATTACK) === 0;
            return !hasAttack && !hasRangedAttack;
        }
    });
    console.log('attacking:', target);
    if(target) {
        creep.moveTo(target);
        creep.attack(target);
    }
};
