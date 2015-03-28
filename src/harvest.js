'use strict';

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

module.exports = exports = function (creep) {
    var spawn = Game.spawns[creep.memory.spawnName];
    if (!isViable(creep)) {
        creep.suicide();
    } else if (creep.energy < creep.energyCapacity) {
        if (!spawn.memory.targetSourceId) {
            var s = creep.pos.findClosest(Game.SOURCES, {
                filter: function(source) {
                    return source.energy > 20;
                }
            });
            if (s) {
                spawn.memory.targetSourceId = s.id;
            }
        }

        if (spawn.memory.targetSourceId) {
            let source = Game.getObjectById(spawn.memory.targetSourceId);
            if (source && source.energy > 10) {
                creep.moveTo(source);
                creep.harvest(source);
            } else {
                spawn.memory.targetSourceId = null;
            }
        }
    } else {
        creep.moveTo(spawn);
        creep.transferEnergy(spawn);
    }
};
