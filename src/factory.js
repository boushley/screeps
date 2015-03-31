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

let buildCreep = exports.buildCreep = function(strategy, type, level) {
    let id = Math.random().toString(32).substr(2, 8),
        buildInfo = type.getCreep(level, strategy);

    let result = strategy.createCreep(buildInfo.parts, type + '-' + id, buildInfo.memory);

    if (result === Game.OK) {
        console.log('Created', type + '-' + id, 'Cost:', calculateCost(buildInfo.parts));
    }
};


function calculateCost(parts) {
    let cost = 0;

    parts.forEach(p => cost += c.PART_COST[p]);
}

function loopTypes(strategy, threshold, level) {
    if (strategy.isSpawnReady(threshold)) {
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
            buildCreep(strategy, type, level);
            return;
        }
    }
}

exports.run = function(strategy) {
    if (!strategy.isSpawnReady()) {
        return;
    }

    loopTypes(strategy, 800, 3);
    loopTypes(strategy, 600, 2);
    loopTypes(strategy, 400, 1);
    loopTypes(strategy, 0, 0);
};
