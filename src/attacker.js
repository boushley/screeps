'use strict';

let BaseRole = require('base-role');

class Attacker extends BaseRole {
    static key() {
        return 'attacker';
    }

    run() {
        let target = this.spawn.pos.findClosest(Game.HOSTILE_CREEPS, {
            filter: c => {
                let hasAttack = c.getActiveBodyparts(Game.ATTACK) === 0,
                    hasHeal = c.getActiveBodyparts(Game.HEAL) === 0,
                    hasRangedAttack = c.getActiveBodyparts(Game.RANGED_ATTACK) === 0;
                return hasAttack || hasHeal || hasRangedAttack;
            }
        });

        if(target) {
            this.creep.moveTo(target);
            this.creep.attack(target);
        }
    }
}

module.exports = Attacker;
