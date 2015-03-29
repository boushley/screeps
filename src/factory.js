'use strict';

let counts = require('counts');

const TYPES_INFO = Object.freeze([
    {
        counts: [1, 2, 2],
        type: 'harvester',
        parts: [Game.WORK, Game.CARRY, Game.MOVE]
    },
    {
        type: 'attack',
        counts: [0],
        parts: [Game.ATTACK, Game.RANGED_ATTACK, Game.MOVE]
    },
    {
        type: 'builder',
        counts: [0, 0, 1],
        parts: [Game.WORK, Game.CARRY, Game.MOVE]
    },
    {
        type: 'healer',
        counts: [0, 1, 2],
        parts: [Game.MOVE, Game.HEAL]
    },
    {
        type: 'rangedGuard',
        counts: [1, 1, 3],
        parts: [Game.RANGED_ATTACK, Game.MOVE]
    },
    {
        type: 'guard',
        counts: [1, 2, 3],
        parts: [Game.ATTACK, Game.MOVE]
    }
]);
const COSTS = Object.freeze({
    move: 50,
    work: 20,
    carry: 50,
    attack: 80,
    'ranged_attack': 150,
    heal: 200,
    tough: 20
});

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
        console.log('Created', type + '-' + id, 'Cost:', calculateCost(parts));
    }
};


function calculateCost(parts) {
    let cost = 0;

    parts.forEach(p => cost += COSTS[p]);
}

function loopTypes(spawn, threshold, level) {
    if (spawn.energy < threshold || spawn.spawning) {
        return;
    }

    for (let i = 0; i < TYPES_INFO.length; i++) {
        let typeInfo = TYPES_INFO[i],
            c = typeInfo.counts[level];

        if (counts[typeInfo.type] === undefined) {
            counts[typeInfo.type] = 0;
        }
        if (counts[typeInfo.type] < c) {
            buildCreep(spawn, typeInfo.type, typeInfo.parts);
            return;
        }
    }
}

exports.run = function(spawn) {
    if (!spawn || spawn.spawning) {
        return;
    }

    loopTypes(spawn, counts, 800, 3);
    loopTypes(spawn, counts, 600, 2);
    loopTypes(spawn, counts, 400, 1);
    loopTypes(spawn, counts, 0, 0);
};
