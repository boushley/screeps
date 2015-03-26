module.exports = exports = function(creep) {
    if(creep.energy === 0) {
        creep.moveTo(Game.spawns.Spawn1);
        Game.spawns.Spawn1.transferEnergy(creep);
    }
    else {
        var target = creep.pos.findClosest(Game.CONSTRUCTION_SITES);
        if(target) {
            creep.moveTo(target);
            creep.build(target);
        }
    }
};
