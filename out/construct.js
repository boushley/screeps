var _ = require('lodash');

var buildCreep = exports.buildCreep = function(spawn, type, parts) {
    spawn.memory.counts[type] += 1;
    console.log(type, 'Created', spawn.memory.counts[type] );
    Game.spawns.Spawn1.createCreep(
        parts,
        type + ' ' + spawn.memory.counts[type] ,
        {
            role: type,
            spawn: spawn
        }
    );
};

var typeParts = {
    harvester: [Game.WORK, Game.CARRY, Game.MOVE],
    attack: [Game.ATTACK, Game.RANGED_ATTACK, Game.MOVE],
    guard: [Game.ATTACK, Game.MOVE]
};
var orderedTypes = ['harvester', 'attack', 'guard'];

exports.run = function(spawn){
    if (!spawn || spawn.spawning) {
        return;
    }
    for (var i = 0; i < orderedTypes.length; i++) {
        var type = orderedTypes[i];
        if (!spawn.memory.counts) {
            spawn.memory.counts = {};
        }
        console.log("All Counts:", JSON.stringify(spawn.memory.counts));
        if (spawn.memory.counts[type] === undefined) {
            spawn.memory.counts[type] = 0;
        }
        console.log("All Counts:", JSON.stringify(spawn.memory.counts));
        console.log('Checking', type, 'count:', spawn.memory.counts[type]);
        if (spawn.memory.counts[type] < 2) {
            return buildCreep(spawn, type, typeParts[type]);
        }
    }
};
