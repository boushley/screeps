"use strict";

var factory = require("factory"),
    command = require("command"),
    SpawnStrategy = require("spawn-strategy"),
    memoryCleaner = require("memory-cleaner");

var rootSpawn = Game.spawns.Spawn1;
if (rootSpawn) {
    memoryCleaner(rootSpawn.id);

    var strategy = new SpawnStrategy(rootSpawn);

    factory.run(strategy);
    command.run();
}