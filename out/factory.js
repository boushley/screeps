"use strict";

var c = require("constants");

var buildCreep = exports.buildCreep = function (strategy) {
    var id = Math.random().toString(32).substr(2, 8),
        buildInfo = strategy.getCreepToBuild(),
        name = buildInfo.memory.role + "-" + id,
        cost = calculateCost(buildInfo.parts);

    if (!strategy.isSpawnReady(cost)) {
        return;
    }

    var result = strategy.createCreep(buildInfo.parts, name, buildInfo.memory);

    if (result === Game.OK) {
        console.log("Created:", JSON.stringify(buildInfo), "Cost:", calculateCost(buildInfo.parts));
    } else {
        console.log("Failed to Create code:", result);
    }
};

exports.run = function (strategy) {
    if (!strategy.isSpawnReady()) {
        return;
    }

    buildCreep(strategy);
};

function calculateCost(parts) {
    var cost = 0;
    parts.forEach(function (p) {
        return cost += c.PART_COST[p];
    });
    return cost;
}