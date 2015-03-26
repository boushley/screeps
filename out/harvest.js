module.exports = exports = function (creep) {
    if (creep.energy < creep.energyCapacity) {
        var source = creep.pos.findClosest(Game.SOURCES);
        if (source) {
            creep.moveTo(source);
            creep.harvest(source);
        }
    } else {
        creep.moveTo(Game.spawns.Spawn1);
        creep.transferEnergy(Game.spawns.Spawn1);
    }
};
