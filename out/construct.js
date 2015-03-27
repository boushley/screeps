var _ = require('lodash');

var buildCreep = exports.buildCreep = function(spawn, type, parts) {
    var id = Math.random().toString(32).substr(2, 8);

    var result = Game.spawns.Spawn1.createCreep(
        parts,
        type + '-' + id,
        {
            id: id,
            role: type,
            spawnName: spawn.name
        }
    );

    if (result === Game.OK) {
        console.log('Created', type+'-'+id);
    }
};

var typesInfo = {
    harvester: {
        counts: [1],
        parts: [Game.WORK, Game.CARRY, Game.MOVE]
    },
    attack: {
        counts: [0],
        parts: [Game.ATTACK, Game.RANGED_ATTACK, Game.MOVE]
    },
    builder: {
        counts: [0],
        parts: [Game.WORK, Game.CARRY, Game.MOVE]
    },
    healer: {
        counts: [0, 1],
        parts: [Game.HEAL, Game.MOVE]
    },
    rangedGuard: {
        counts: [1, 1, 2],
        parts: [Game.RANGED_ATTACK, Game.MOVE]
    },
    guard: {
        counts: [1, 2, 2],
        parts: [Game.ATTACK, Game.MOVE]
    }
};
var orderedTypes = ['harvester', 'attack', 'guard', 'rangedGuard', 'builder', 'healer'];

exports.run = function(spawn){
    if (!spawn || spawn.spawning) {
        return;
    }
    var counts = getCounts();

    for (var i = 0; i < orderedTypes.length; i++) {
        var type = orderedTypes[i],
            typeInfo = typesInfo[type],
            c = typeInfo.counts[0];

        if (counts[type] === undefined) {
            counts[type] = 0;
        }
        if (counts[type] < c) {
            return buildCreep(spawn, type, typeInfo.parts);
        }
    }

    if (spawn.energy > 400) {
        for (var i = 0; i < orderedTypes.length; i++) {
            var type = orderedTypes[i],
                typeInfo = typesInfo[type],
                c = typeInfo.counts[1] || typeInfo.counts[0];
            if (counts[type] < c) {
                return buildCreep(spawn, type, typeInfo.parts);
            }
        }
    }

    if (spawn.energy > 600) {
        for (var i = 0; i < orderedTypes.length; i++) {
            var type = orderedTypes[i],
                typeInfo = typesInfo[type],
                c = typeInfo.counts[2] || typeInfo.counts[0];
            if (counts[type] < c) {
                return buildCreep(spawn, type, typeInfo.parts);
            }
        }
    }
};

function getCounts() {
    var counts = {};

    for(var i in Game.creeps) {
        var creep = Game.creeps[i];
        if (!creep.my) {
            continue;
        }

        var role = creep.memory.role;

        if (counts[role] === undefined) {
            counts[role] = 1;
        } else {
            counts[role] += 1;
        }
    }

    return counts;
}
