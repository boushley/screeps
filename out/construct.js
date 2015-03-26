var _ = require('lodash');

var buildCreep = exports.buildCreep = function(spawn, type, parts) {
    var id = Math.random().toString(32).substr(2, 8);
    console.log(type, 'Created', id);
    Game.spawns.Spawn1.createCreep(
        parts,
        type + '-' + id,
        {
            id: id,
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
    var counts = getCounts();
    for (var i = 0; i < orderedTypes.length; i++) {
        var type = orderedTypes[i];
        console.log("All Counts:", JSON.stringify(counts));
        if (spawn.memory.counts[type] === undefined) {
            spawn.memory.counts[type] = 0;
        }
        console.log("All Counts:", JSON.stringify(counts));
        console.log('Checking', type, 'count:', counts[type]);
        if (counts[type] < 1) {
            return buildCreep(spawn, type, typeParts[type]);
        }
    }
};

function getCounts() {
    var counts = {};

    for(i in Game.creeps) {
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
