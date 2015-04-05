'use strict';

let c = require('constants');

let buildCreep = exports.buildCreep = function(strategy) {
    let id = Math.random().toString(32).substr(2, 8),
        buildInfo = strategy.getCreepToBuild(),
        name = buildInfo.memory.role + '-' + id,
        cost = calculateCost(buildInfo.parts);

    if (!strategy.isSpawnReady(cost)) {
        return;
    }

    let result = strategy.createCreep(buildInfo.parts, name, buildInfo.memory);

    if (typeof result !== 'string') {
        console.log('Failed to Create code:', result, 'Cost:', calculateCost(buildInfo.parts));
    }
};

exports.run = function(strategy) {
    if (!strategy.isSpawnReady()) {
        return;
    }

    buildCreep(strategy);
};

function calculateCost(parts) {
    let cost = 0;
    parts.forEach(p => cost += c.PART_COST[p]);
    return cost;
}
