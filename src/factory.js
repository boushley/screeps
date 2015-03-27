let _ = require('lodash');

const TYPES_INFO = Object.freeze({
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
});
const COSTS = Object.freeze({
    move: 50,
    work: 20,
    carry: 50,
    attack: 80,
    ranged_attack: 150,
    heal: 200,
    tough: 20
});
const ORDERED_TYPES = Object.freeze(['harvester', 'attack', 'guard', 'rangedGuard', 'builder', 'healer']);

exports.run = function(spawn) {
    if (!spawn || spawn.spawning) {
        return;
    }
    let counts = getCounts();

    loopTypes(0, 0);
    loopTypes(400, 1);
    loopTypes(600, 2);

    function loopTypes(threshold, index) {
        if (spawn.energy < threshold) { return; }
        for (let i = 0; i < ORDERED_TYPES.length; i++) {
            let type = ORDERED_TYPES[i],
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

let buildCreep = exports.buildCreep = function(spawn, type, parts) {
    let id = Math.random().toString(32).substr(2, 8);

    let result = Game.spawns.Spawn1.createCreep(
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
    let counts = {};

    for(let i in Game.creeps) {
        let creep = Game.creeps[i];
        if (!creep.my) {
            continue;
        }

        let role = creep.memory.role;

        if (counts[role] === undefined) {
            counts[role] = 1;
        } else {
            counts[role] += 1;
        }
    }

    return counts;
}
