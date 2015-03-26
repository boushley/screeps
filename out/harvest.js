module.exports = exports = function (creep) {
    var spawn = Game.spawns[creep.memory.spawnName];
    if (!isViable(creep)) {
        creep.suicide();
    } else if (creep.energy < creep.energyCapacity) {
        var source = creep.pos.findClosest(Game.SOURCES);
        if (source) {
            creep.moveTo(source);
            creep.harvest(source);
        }
    } else {
        creep.moveTo(spawn);
        creep.transferEnergy(spawn);
    }
};


// Determines if any body parts are completely damanged
function isViable(creep) {
    for (var i = 0; i < creep.body.length; i++) {
        var part = creep.body[i];
        if (part.hits < 1) {
            return false;
        }
    }

    return true;
}
