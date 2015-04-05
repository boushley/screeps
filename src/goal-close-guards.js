(function() {
    'use strict';

    let GoalBase = require('goal-base'),
        Guard = require('guard'),
        Healer = require('healer'),
        creepBreakdown = require('creep-breakdown');

    let breakdown, guards, healers;

    class GoalCloseGuards extends GoalBase {
        static key() {
            return 'goal-close-guards';
        }

        static isComplete() {
            let guardCount = guards.length,
                healerCount = healers.length;

            return guardCount >= 2
                && healerCount >= 1;
        }

        getHealerToBuild() {
            return [Game.TOUGH, Game.MOVE, Game.HEAL];
        }

        getGuardToBuild() {
            return [Game.TOUGH, Game.RANGED_ATTACK, Game.RANGED_ATTACK, Game.MOVE];
        }

        getCreepToBuild() {
            let parts,
                role,
                guardCount = guards.length,
                healerCount = healers.length;

            if (healerCount < guardCount) {
                role = Healer.key();
                parts = this.getHealerToBuild();
            } else {
                role = Guard.key();
                parts = this.getGuardToBuild();
            }

            return {
                parts,
                memory: {
                    role,
                    goal: GoalCloseGuards.key()
                }
            };
        }
    }

    module.exports = GoalCloseGuards;

    breakdown = creepBreakdown.getGoal(GoalCloseGuards.key());
    guards = breakdown.getRole(Guard.key());
    healers = breakdown.getRole(Healer.key());
})();
