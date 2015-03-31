var factory = require('factory'),
    command = require('command'),
    SpawnStrategy = require('spawn-strategy');

let strategy = new SpawnStrategy(Game.spawns.Spawn1);

factory.run(strategy);
command.run();
