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
        minCount: 1,
        niceCount: 1,
        parts: [Game.WORK, Game.CARRY, Game.MOVE]
    },
    attack: {
        minCount: 0,
        niceCount: 0,
        parts: [Game.ATTACK, Game.RANGED_ATTACK, Game.MOVE]
    },
    builder: {
        minCount: 1,
        niceCount: 1,
        parts: [Game.WORK, Game.CARRY, Game.MOVE]
    },
    healer: {
        minCount: 1,
        niceCount: 1,
        parts: [Game.HEAL, Game.MOVE]
    },
    rangedGuard: {
        minCount: 1,
        niceCount: 2,
        parts: [Game.RANGED_ATTACK, Game.MOVE]
    },
    guard: {
        minCount: 1,
        niceCount: 2,
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
            typeInfo = typesInfo[type];

        if (counts[type] === undefined) {
            counts[type] = 0;
        }
        if (counts[type] < typeInfo.minCount) {
            return buildCreep(spawn, type, typeInfo.parts);
        }
    }

    if (spawn.energy > 1000) {
        for (var i = 0; i < orderedTypes.length; i++) {
            var type = orderedTypes[i],
                typeInfo = typesInfo[type];
            if (counts[type] < typeInfo.niceCount) {
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
