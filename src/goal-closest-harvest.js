'use strict';
(function() {
    let GoalBase = require('goal-base'),
        Harvester = require('harvester'),
        Runner = require('role-runner'),
        _ = require('lodash'),
        creepBreakdown = require('creep-breakdown');

    let breakdown, harvesters, runners, harvesterIds;

    class GoalClosestHarvest extends GoalBase {
        static key() {
            return 'goal-closest-harvest';
        }

        static isComplete() {
            let harvestersCount = harvesters.length,
                runnersCount = runners.length,
                enoughHarvesters = harvestersCount >= 2,
                enoughRunners = runnersCount >= 2;

            return enoughHarvesters && enoughRunners;
        }

        static process() {
            runners.forEach(r => {
                r.harvestersToCollect = harvesterIds;
            });
        }

        constructor(...args) {
            super(...args);

            if (!this.memory.targetSourceId) {
                var source = this.spawn.pos.findClosest(Game.SOURCES);
                this.memory.targetSourceId = source.id;
            }
        }

        getCreepToBuild() {
            if (harvesters.length < 2) {
                return {
                    parts: [Game.MOVE, Game.WORK, Game.WORK, Game.WORK, Game.CARRY],
                    memory: {
                        role: Harvester.key(),
                        targetSourceId: this.memory.targetSourceId,
                        goal: GoalClosestHarvest.key()
                    }
                };
            } else if (runners.length < 2) {
                let harvesterIds = _.map(harvesters, h => h.id);
                return {
                    parts: [Game.MOVE, Game.CARRY],
                    memory: {
                        role: Runner.key(),
                        harvestersToCollect: harvesterIds,
                        goal: GoalClosestHarvest.key()
                    }
                };
            } else {
                console.error('What to build?! Goal Closest Harvest');
            }
        }
    }

    module.exports = GoalClosestHarvest;

    breakdown = creepBreakdown.getGoal(GoalClosestHarvest.key());
    harvesters = breakdown.getRole(Harvester.key());
    runners = breakdown.getRole(Runner.key());
    harvesterIds = _.map(harvesters, h => h.id);
})();
