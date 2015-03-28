'use strict';

let BaseRole = require('base-role'),
    c = require('constants');

class Guard extends BaseRole {
    constructor() {
        super(...arguments);
        this.isRangedActive = this.creep.getActiveBodyparts(Game.RANGED_ATTACK) > 0;
        this.isMeleeActive = this.creep.getActiveBodyparts(Game.ATTACK) > 0;
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
        var target = this.creep.pos.findClosest(Game.HOSTILE_CREEPS, {
            filter: h => h.pos.inRangeTo(this.spawn.pos, c.GUARD_RANGE)
        });

        if (target) {
            // TODO If someone has ranged and melee they should use melee if they
            // are in range
            if (this.isRangedActive) {
                let massDamage = this.getRangedMassAttackDamage();
                if (massDamage >= c.RANGED_DAMAGE) {
                    this.creep.rangedMassAttack();
                } else if (target.pos.inRangeTo(this.creep.pos, c.RANGED_RANGE)) {
                    this.creep.rangedAttack(target);
                } else {
                    this.creep.moveTo(target);
                }

                return;
            } else if (this.isMeleeActive) {
                this.creep.moveTo(target);
                this.creep.attack(target);
                return;
            }
        } else {
            let coords = this.getRally();
            this.creep.moveTo(coords.x, coords.y);
        }
    }
}
