module.exports = exports = function (creep) {
    var spawn = Game.spawns[creep.memory.spawnName];
    if (!isViable(creep)) {
        creep.suicide();
    } else if (creep.energy < creep.energyCapacity) {
        if (!creep.memory.targetId) {
            var s = creep.pos.findClosest(Game.SOURCES, {
                filter: function(source) {
                    return source.energy > 20;
                }
            });
            if (s) {
                creep.memory.targetId = s.id;
            }
        }

        if (creep.memory.targetId) {
            var source = Game.getObjectById(creep.memory.targetId);
            if (source && source.energy > 10) {
                creep.moveTo(source);
                creep.harvest(source);
            } else {
                creep.memory.targetId = null;
            }
        }
    } else {
        creep.memory.targetId = null;
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
