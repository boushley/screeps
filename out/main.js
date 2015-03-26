var harvest = require('harvest'),
    build = require('build'),
    guard = require('guard'),
    attack = require('attack'),
    construct = require('construct'),
    i;

construct.run(Game.spawns.Spawn1);

for(i in Game.creeps) {
    var creep = Game.creeps[i];
    if (creep.memory.role === 'harvester') {
        harvest(creep);
    } else if (creep.memory.role === 'builder') {
        build(creep);
    } else if (creep.memory.role === 'guard') {
        guard(creep);
    } else if (creep.memory.role === 'attack') {
        attack(creep);
    }
}
