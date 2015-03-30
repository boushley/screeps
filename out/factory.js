"use strict";

var counts = require("counts"),
    c = require("constants"),
    Harvester = require("harvester"),
    Attacker = require("attacker"),
    Builder = require("builder"),
    Healer = require("healer"),
    Guard = require("guard");

var ORDERED_TYPES = Object.freeze([Harvester, Attacker, Builder, Healer, Guard]);

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
        return cost += c.PART_COST[p];
    });
}

function loopTypes(spawn, threshold, level) {
    if (spawn.energy < threshold || spawn.spawning) {
        return;
    }

    for (var i = 0; i < ORDERED_TYPES.length; i++) {
        var type = ORDERED_TYPES[i],
            _c = type.getCount(level),
            typeKey = type.key();

        if (counts[typeKey] === undefined) {
            counts[typeKey] = 0;
        }
        if (counts[typeKey] < _c) {
            buildCreep(spawn, typeKey, type.getParts(level));
            return;
        }
    }
}

exports.run = function (spawn) {
    if (!spawn || spawn.spawning) {
        return;
    }

    loopTypes(spawn, 800, 3);
    loopTypes(spawn, 600, 2);
    loopTypes(spawn, 400, 1);
    loopTypes(spawn, 0, 0);
};