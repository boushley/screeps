var _ = require('lodash');

var TYPES_INFO = {
    harvester: {
        counts: [1, 2],
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
var COSTS = {
    move: 50,
    work: 20,
    carry: 50,
    attack: 80,
    ranged_attack: 150,
    heal: 200,
    tough: 20
};
var ORDERED_TYPES = ['harvester', 'attack', 'guard', 'rangedGuard', 'builder', 'healer'];

exports.run = function(spawn) {
    if (!spawn || spawn.spawning) {
        return;
    }
    var counts = getCounts();

    loopTypes(0, 0);
    loopTypes(400, 1);
    loopTypes(600, 2);

    function loopTypes(threshold, index) {
        if (spawn.energy < threshold) { return; }
        for (var i = 0; i < ORDERED_TYPES.length; i++) {
            var type = ORDERED_TYPES[i],
                typeInfo = TYPES_INFO[type],
                c = typeInfo.counts[index];

            if (counts[type] === undefined) {
                counts[type] = 0;
            }
            if (counts[type] < c) {
                return buildCreep(spawn, type, typeInfo.parts);
            }
        }
    }
};

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
