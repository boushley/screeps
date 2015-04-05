(function() {
    'use strict';

    class SpawnStrategy {
        constructor(spawn) {
            this.spawn = spawn;

            if (!Memory.strategy) {
                Memory.strategy = {};
            }
            this.memory = Memory.strategy;

            if (!this.memory.goalMemories) {
                this.memory.goalMemories = {};
            }

            if (!Game.flags.BoushleyRally && spawn) {
                spawn.room.createFlag(
                    spawn.pos.x + 3,
                    spawn.pos.y - 3,
                    'BoushleyRally',
                    Game.COLOR_GREEN
                );
            }

            for (let GoalClass of PROGRESSIVE_GOALS) {
                if (GoalClass.process) {
                    GoalClass.process();
                }

                if (!this.goal && !GoalClass.isComplete()) {
                    let goalKey = GoalClass.key();
                    if (!this.memory.goalMemories[goalKey]) {
                        this.memory.goalMemories[goalKey] = {};
                    }
                    this.goal = new GoalClass(this.memory.goalMemories[goalKey], this.spawn);
                    break;
                }
            }
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

        getCreepToBuild() {
            return this.goal.getCreepToBuild();
        }
    }

    module.exports = SpawnStrategy;

    const PROGRESSIVE_GOALS = Object.freeze([
        require('goal-closest-harvest'),
        require('goal-close-guards'),
        require('goal-mine-kept-source')
    ]);
})();
