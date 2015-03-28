"use strict";

var TYPES_INFO = Object.freeze([{
    counts: [1, 2, 2],
    type: "harvester",
    parts: [Game.WORK, Game.CARRY, Game.MOVE]
}, {
    type: "attack",
    counts: [0],
    parts: [Game.ATTACK, Game.RANGED_ATTACK, Game.MOVE]
}, {
    type: "builder",
    counts: [0, 0, 1],
    parts: [Game.WORK, Game.CARRY, Game.MOVE]
}, {
    type: "healer",
    counts: [0, 1, 2],
    parts: [Game.HEAL, Game.MOVE]
}, {
    type: "rangedGuard",
    counts: [1, 1, 3],
    parts: [Game.RANGED_ATTACK, Game.MOVE]
}, {
    type: "guard",
    counts: [1, 2, 3],
    parts: [Game.ATTACK, Game.MOVE]
}]);
var COSTS = Object.freeze({
    move: 50,
    work: 20,
    carry: 50,
    attack: 80,
    ranged_attack: 150,
    heal: 200,
    tough: 20
});

var buildCreep = exports.buildCreep = function (spawn, type, parts) {
    var id = Math.random().toString(32).substr(2, 8);

    var result = Game.spawns.Spawn1.createCreep(parts, type + "-" + id, {
        id: id,
        role: type,
        spawnName: spawn.name
    });

    if (result === Game.OK) {
        console.log("Created", type + "-" + id, "Cost:", calculateCost(parts));
    }
};

function calculateCost(parts) {
    var cost = 0;

    parts.forEach(function (p) {
        return cost += COSTS[p];
    });
}

function getCounts() {
    var counts = {};

    for (var i in Game.creeps) {
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

function loopTypes(spawn, counts, threshold, level) {
    if (spawn.energy < threshold) {
        return;
    }

    for (var i = 0; i < TYPES_INFO.length; i++) {
        var typeInfo = TYPES_INFO[i],
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

exports.run = function (spawn) {
    if (!spawn || spawn.spawning) {
        return;
    }
    var counts = getCounts();

    loopTypes(spawn, counts, 0, 0);
    loopTypes(spawn, counts, 400, 1);
    loopTypes(spawn, counts, 600, 2);
    loopTypes(spawn, counts, 800, 3);
};