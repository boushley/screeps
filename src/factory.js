'use strict';

let counts = require('counts'),
    c = require('constants'),
    Harvester = require('harvester'),
    Attacker = require('attacker'),
    Builder = require('builder'),
    Healer = require('healer'),
    Guard = require('guard');

const ORDERED_TYPES = Object.freeze([
    Harvester,
    Attacker,
    Builder,
    Healer,
    Guard
]);

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

    parts.forEach(p => cost += c.PART_COST[p]);
}

function loopTypes(spawn, threshold, level) {
    if (spawn.energy < threshold || spawn.spawning) {
        return;
    }

    for (let i = 0; i < ORDERED_TYPES.length; i++) {
        let type = ORDERED_TYPES[i],
            c = type.getCount(level),
            typeKey = type.key();

        if (counts[typeKey] === undefined) {
            counts[typeKey] = 0;
        }
        if (counts[typeKey] < c) {
            buildCreep(spawn, typeKey, type.getParts(level));
            return;
        }
    }
}

exports.run = function(spawn) {
    if (!spawn || spawn.spawning) {
        return;
    }

    loopTypes(spawn, 800, 3);
    loopTypes(spawn, 600, 2);
    loopTypes(spawn, 400, 1);
    loopTypes(spawn, 0, 0);
};
