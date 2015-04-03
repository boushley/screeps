'use strict';

let GoalBase = require('goal-base'),
    Harvester = require('harvester'),
    Runner = require('role-runner'),
    _ = require('lodash');

class GoalClosestHarvest extends GoalBase {
    static key() {
        return 'goal-closest-harvest';
    }

    static isComplete() {
        let harvesters = _.filter(Game.creeps, c => {
                let isHarvester = c.memory.role === Harvester.key(),
                    thisGoal = c.memory.goal === GoalClosestHarvest.key();
                return c.my && isHarvester && thisGoal;
            }),
            runners = _.filter(Game.creeps, c => {
                let isRunner = c.memory.role === Runner.key(),
                    thisGoal = c.memory.goal === GoalClosestHarvest.key();
                return c.my && isRunner && thisGoal;
            }),
            enoughHarvesters = harvesters.length >= 2,
            enoughRunners = runners.length >= 2;
        return enoughHarvesters && enoughRunners;
    }

    constructor(...args) {
        super(...args);

        if (!this.memory.targetSourceId) {
            var source = this.spawn.pos.findClosest(Game.SOURCES, {
                filter: s => s.energy > 20
            });
            this.memory.targetSourceId = source.id;
        }
    }

    getCreepToBuild() {
        let harvesters = _.filter(Game.creeps, c => {
                let isHarvester = c.memory.role === Harvester.key(),
                    thisGoal = c.memory.goal === GoalClosestHarvest.key();
                return c.my && isHarvester && thisGoal;
            }),
            runners = _.filter(Game.creeps, c => {
                let isRunner = c.memory.role === Runner.key(),
                    thisGoal = c.memory.goal === GoalClosestHarvest.key();
                return c.my && isRunner && thisGoal;
            });

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
