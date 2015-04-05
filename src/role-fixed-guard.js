'use strict';

let BaseRole = require('base-role'),
    c = require('constants');

class FixedGuard extends BaseRole {
    constructor(...args) {
        super(...args);
        this.isRangedActive = this.creep.getActiveBodyparts(Game.RANGED_ATTACK) > 0;
        if (!this.memory.location) {
            console.error('Missing memory location for FixedGuard');
        }
    }

    static key() {
        return 'fixed-guard';
    }

    getRangedMassAttackDamage() {
        let damageCanDeal = 0;
        this.creep.pos.findInRange(Game.HOSTILE_CREEPS, c.RANGED_RANGE).forEach(e => {
            let range = this.creep.pos.getRangeTo(e.pos);
            damageCanDeal += c.RANGED_MASS_DAMAGE[range];
        });
        return damageCanDeal;
    }

    run() {
        let l = this.memory.location,
            pos = this.creep.pos;

        this.creep.moveTo(l.x, l.y);

        let target = this.creep.pos.findClosest(Game.HOSTILE_CREEPS, {
                filter: h => h.pos.inRangeTo(pos, c.RANGED_RANGE)
            });

        if (target) {
            let massDamage = this.getRangedMassAttackDamage(),
                rangedDamage = 10;

            if (massDamage >= rangedDamage && massDamage > 0) {
                this.creep.rangedMassAttack();
            } else if (rangedDamage > 0) {
                this.creep.rangedAttack(target);
            }
        }
    }
}

module.exports = FixedGuard;
