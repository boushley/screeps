'use strict';

(function() {
    let GoalBase = require('goal-base'),
        Harvester = require('harvester'),
        Runner = require('role-runner'),
        FixedGuard = require('role-fixed-guard'),
        FixedHealer = require('role-fixed-healer'),
        _ = require('lodash'),
        creepBreakdown = require('creep-breakdown');

    let breakdown, harvesters, runners, guards, healers;

    class GoalMineKeptSource extends GoalBase {
        static key() {
            return 'goal-mine-kept-source';
        }

        static isComplete() {
            let healerCount = healers.length,
                guardCount = guards.length,
                harvestersCount = harvesters.length,
                runnersCount = runners.length;

            return healerCount >= 2
                && guardCount >= 1
                && harvestersCount >= 2
                && runnersCount >= 3;
        }

        constructor(...args) {
            super(...args);

            if (!this.memory.targetSourceId) {
                let closestKey = require('goal-closest-harvest').key(),
                    otherMemory = Memory.strategy.goalMemories[closestKey],
                    minedSourceId = otherMemory.targetSourceId,
                    source = this.spawn.pos.findClosest(Game.SOURCES, {
                        filter: s => s.id !== minedSourceId
                    });

                this.memory.targetSourceId = source.id;
                this.memory.guardLocation = {
                    x: source.pos.x,
                    y: source.pos.y + 2
                };
            }
        }

        getCreepToBuild() {
            if (healers.length < 2) {
                var l = {
                    x: this.memory.guardLocation.x,
                    y: this.memory.guardLocation.y + 1
                };

                if (healers.length === 0) {
                    l.x -= 1;
                }

                return {
                    parts: [Game.MOVE, Game.HEAL, Game.HEAL, Game.HEAL],
                    memory: {
                        role: FixedHealer.key(),
                        goal: GoalMineKeptSource.key(),
                        location: l
                    }
                };
            } else if (guards.length < 1) {
                return {
                    parts: [Game.MOVE, Game.RANGED_ATTACK, Game.RANGED_ATTACK, Game.RANGED_ATTACK],
                    memory: {
                        role: FixedGuard.key(),
                        goal: GoalMineKeptSource.key(),
                        location: {
                            x: this.memory.guardLocation.x,
                            y: this.memory.guardLocation.y
                        }
                    }
                };
            } else if (harvesters.length < 2) {
                let l = {
                    x: this.memory.guardLocation.x,
                    y: this.memory.guardLocation.y + 3
                };

                return {
                    parts: [Game.MOVE, Game.WORK, Game.WORK, Game.WORK, Game.CARRY],
                    memory: {
                        role: Harvester.key(),
                        goal: GoalMineKeptSource.key(),
                        fallbackLocation: l,
                        targetSourceId: this.memory.targetSourceId
                    }
                };
            } else if (runners.length < 3) {
                let harvesterIds = _.map(harvesters, h => h.id);
                return {
                    parts: [Game.MOVE, Game.CARRY],
                    memory: {
                        role: Runner.key(),
                        goal: GoalMineKeptSource.key(),
                        harvestersToCollect: harvesterIds
                    }
                };
            } else {
                console.error('What to build?! Goal Mine Kept Source');
            }
        }
    }

    module.exports = GoalMineKeptSource;

    breakdown = creepBreakdown.getGoal(GoalMineKeptSource.key());
    harvesters = breakdown.getRole(Harvester.key());
    runners = breakdown.getRole(Runner.key());
    guards = breakdown.getRole(FixedGuard.key());
    healers = breakdown.getRole(FixedHealer.key());
})();
