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

    getCreepToBuild() {
        let parts,
            role,
            guardCount = counts[Guard.key()] || 0,
            healerCount = counts[Healer.key()] || 0;

        if (guardCount < 1) {
            role = Guard.key();
            parts = [Game.RANGED_ATTACK, Game.MOVE];
        } else if (healerCount < 1) {
            role = Healer.key();
            parts = [Game.MOVE, Game.HEAL];
        } else if (guardCount < 2) {
            role = Guard.key();
            parts = [Game.RANGED_ATTACK, Game.MOVE];
        } else if (healerCount < 2) {
            role = Healer.key();
            parts = [Game.MOVE, Game.HEAL, Game.MOVE, Game.HEAL];
        } else {
            role = Guard.key();
            parts = [Game.TOUGH, Game.TOUGH, Game.RANGED_ATTACK, Game.MOVE];
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

