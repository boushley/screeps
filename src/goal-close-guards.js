'use strict';

let GoalBase = require('goal-base'),
    counts = require('counts'),
    Guard = require('guard'),
    Healer = require('healer');

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

        if (healerCount < 1) {
            parts = [Game.MOVE, Game.HEAL];
        } else if (healerCount < 3) {
            parts = [Game.MOVE, Game.HEAL, Game.MOVE, Game.HEAL];
        } else if (healerCount < 6) {
            parts = [Game.TOUGH, Game.MOVE, Game.HEAL, Game.MOVE, Game.HEAL];
        } else {
            parts = [Game.TOUGH, Game.MOVE, Game.HEAL, Game.HEAL, Game.MOVE, Game.HEAL];
        }

        return parts;
    }

    getGuardToBuild() {
        let guardCount = counts[Guard.key()] || 0,
            parts;

        if (guardCount < 1) {
            parts = [Game.RANGED_ATTACK, Game.MOVE];
        } else if (guardCount < 3) {
            parts = [Game.TOUGH, Game.TOUGH, Game.RANGED_ATTACK, Game.MOVE];
        } else if (guardCount < 6) {
            parts = [Game.TOUGH, Game.TOUGH, Game.RANGED_ATTACK, Game.MOVE, Game.RANGED_ATTACK, Game.MOVE];
        } else {
            parts =  [Game.TOUGH, Game.TOUGH, Game.RANGED_ATTACK, Game.MOVE, Game.RANGED_ATTACK, Game.RANGED_ATTACK, Game.MOVE];
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
