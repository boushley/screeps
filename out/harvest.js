module.exports = exports = function (creep) {
    var spawn = Game.spawns[creep.memory.spawnName];
    if (creep.energy < creep.energyCapacity) {
        var source = spawn.pos.findClosest(Game.SOURCES);
        if (source) {
            creep.moveTo(source);
            creep.harvest(source);
        }
    } else {
        creep.moveTo(spawn);
        creep.transferEnergy(spawn);
    }
};

