var _ = require('lodash');

var buildCreep = exports.buildCreep = function(spawn, type, parts) {
    var id = Math.random().toString(32).substr(2, 8);
    console.log(type, 'Created', id);
    Game.spawns.Spawn1.createCreep(
        parts,
        type + '-' + id,
        {
            id: id,
            role: type,
            spawn: spawn
        }
    );
};

var typesInfo = {
    harvester: {
        minCount: 2,
        parts: [Game.WORK, Game.CARRY, Game.MOVE]
    },
    attack: {
        minCount: 0,
        parts: [Game.ATTACK, Game.RANGED_ATTACK, Game.MOVE]
    },
    rangedGuard: {
        minCount: 1,
        parts: [Game.RANGED_ATTACK, Game.MOVE]
    },
    guard: {
        minCount: 1,
        parts: [Game.ATTACK, Game.MOVE]
    }
};
var orderedTypes = ['harvester', 'attack', 'guard', 'rangedGuard'];

exports.run = function(spawn){
    if (!spawn || spawn.spawning) {
        return;
    }
    var counts = getCounts();
    for (var i = 0; i < orderedTypes.length; i++) {
        var type = orderedTypes[i],
            typeInfo = typesInfo[type];

        console.log("All Counts:", JSON.stringify(counts));
        if (counts[type] === undefined) {
            counts[type] = 0;
        }
        console.log("All Counts:", JSON.stringify(counts));
        console.log('Checking', type, 'count:', counts[type]);
        if (counts[type] < typeInfo.minCount) {
            return buildCreep(spawn, type, typeInfo.parts);
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
