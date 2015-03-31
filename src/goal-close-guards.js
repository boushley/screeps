'use strict';

let GoalBase = require('goal-base'),
    counts = require('counts'),
    Guard = require('guard'),
    Healer = require('healer');

const ADVANCED_UNIT_THRESHOLD = 1000;

class GoalCloseGuards extends GoalBase {
    static key() {
        return 'goal-close-guards';
    }

    static isComplete() {
        return false;
    }

    getHealerToBuild() {
        let healerCount = counts[Healer.key()] || 0,
            parts;

        if (this.spawn.energy > ADVANCED_UNIT_THRESHOLD) {
            parts = [Game.TOUGH, Game.MOVE, Game.HEAL, Game.MOVE, Game.HEAL];
        } else if (healerCount < 1) {
            parts = [Game.MOVE, Game.HEAL];
        } else {
            parts = [Game.MOVE, Game.HEAL, Game.MOVE, Game.HEAL];
        }

        return parts;
    }

    getGuardToBuild() {
        let guardCount = counts[Guard.key()] || 0,
            parts;

        if (this.spawn.energy > ADVANCED_UNIT_THRESHOLD) {
            parts = [Game.TOUGH, Game.TOUGH, Game.RANGED_ATTACK, Game.MOVE, Game.RANGED_ATTACK, Game.MOVE];
        } else if (guardCount < 1) {
            parts = [Game.RANGED_ATTACK, Game.MOVE];
        } else {
            parts = [Game.TOUGH, Game.TOUGH, Game.RANGED_ATTACK, Game.MOVE];
        }

        return parts;
    }

    getCreepToBuild() {
        let parts,
            role,
            guardCount = counts[Guard.key()] || 0,
            healerCount = counts[Healer.key()] || 0;

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

module.exports = GoalCloseGuards;
