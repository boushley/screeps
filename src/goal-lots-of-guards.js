(function() {
    'use strict';

    let GoalBase = require('goal-base'),
        Guard = require('guard'),
        Healer = require('healer'),
        creepBreakdown = require('creep-breakdown');

    let breakdown, guards, healers;

    class GoalLotsOfGuards extends GoalBase {
        static key() {
            return 'goal-lots-of-guards';
        }

        static isComplete() {
            return false;
        }

        getHealerToBuild() {
            let healerCount = healers.length,
                parts;

            if (healerCount < 3) {
                parts = [Game.MOVE, Game.HEAL, Game.MOVE, Game.HEAL];
            } else if (healerCount < 6) {
                parts = [Game.TOUGH, Game.MOVE, Game.HEAL, Game.MOVE, Game.HEAL];
            } else {
                parts = [Game.TOUGH, Game.MOVE, Game.HEAL, Game.HEAL, Game.MOVE, Game.HEAL];
            }

            return parts;
        }

        getGuardToBuild() {
            let guardCount = guards.length,
                parts;

            if (guardCount < 3) {
                parts = [Game.TOUGH, Game.TOUGH, Game.RANGED_ATTACK, Game.MOVE];
            } else if (guardCount < 6) {
                parts = [Game.TOUGH, Game.TOUGH, Game.RANGED_ATTACK, Game.MOVE, Game.RANGED_ATTACK, Game.MOVE];
            } else {
                parts = [Game.TOUGH, Game.TOUGH, Game.RANGED_ATTACK, Game.MOVE, Game.RANGED_ATTACK, Game.RANGED_ATTACK, Game.MOVE];
            }

            return parts;
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
                    role
                }
            };
        }
    }

    module.exports = GoalLotsOfGuards;

    breakdown = creepBreakdown.getGoal(GoalLotsOfGuards.key());
    guards = breakdown.getRole(Guard.key());
    healers = breakdown.getRole(Healer.key());
})();
