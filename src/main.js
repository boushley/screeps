'use strict';

let factory = require('factory'),
    command = require('command'),
    SpawnStrategy = require('spawn-strategy'),
    memoryCleaner = require('memory-cleaner');

let rootSpawn = Game.spawns.Spawn1;
if (rootSpawn) {
    memoryCleaner(rootSpawn.id);

    let strategy = new SpawnStrategy(rootSpawn);

    factory.run(strategy);
    command.run();
}
