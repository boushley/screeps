'use strict';

class SpawnStrategy {
    constructor(spawn) {
        this.spawn = spawn;
        this.memory = {};
        Memory.strategy = this.memory;
    }

    isSpawnReady(thresholdEnergy) {
        if (!this.spawn) {
            return false;
        }
        if (this.spawn.spawning) {
            return false;
        }

        thresholdEnergy = thresholdEnergy || 0;
        if (thresholdEnergy > this.spawn.energy) {
            return false;
        }

        return true;
    }

    createCreep(parts, name, memory) {
        memory.spawnName = memory.spawnName || this.spawn.name;

        return this.spawn.createCreep(parts, name, memory);
    }
}

module.exports = SpawnStrategy;
