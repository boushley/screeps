'use strict';

let BaseRole = require('base-role'),
    c = require('constants');

class Guard extends BaseRole {
    constructor() {
        super(...arguments);
        this.isRangedActive = this.creep.getActiveBodyparts(Game.RANGED_ATTACK) > 0;
        this.isMeleeActive = this.creep.getActiveBodyparts(Game.ATTACK) > 0;
        this.allWeaponsDamaged = !this.isRangedActive && !this.isMeleeActive;
    }

    static k() {
        return 'guard';
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
        if (this.allWeaponsDamaged) {
            this.creep.moveTo(this.spawn);
            return;
        }

        let target = this.creep.pos.findClosest(Game.HOSTILE_CREEPS, {
                filter: h => h.pos.inRangeTo(this.spawn.pos, c.GUARD_RANGE)
            }),
            pos = this.creep.pos,
            hasMoved = false;

        if (target) {
            let p = this.getDefensivePosition(),
                defensiveDirection = pos.getDirectionTo(p);

            if (this.isRangedActive) {
                let massDamage = this.getRangedMassAttackDamage(),
                    targetRange = pos.getRangeTo(target.pos),
                    targetDirection = pos.getDirectionTo(target.pos),
                    rangedDamage;

                if (targetRange <= c.RANGED_RANGE) {
                    rangedDamage = 10;
                } else {
                    rangedDamage = 0;
                }

                if (massDamage >= rangedDamage && massDamage > 0) {
                    this.creep.rangedMassAttack();
                } else if (rangedDamage > 0) {
                    this.creep.rangedAttack(target);
                }

                if (targetRange < 3 || targetDirection === defensiveDirection) {
                    this.creep.move(defensiveDirection);
                    hasMoved = true;
                } else if (targetRange > 3) {
                    this.creep.move(targetDirection);
                    hasMoved = true;
                }
            }

            if (this.isMeleeActive) {
                let canAttack = pos.isNearTo(target.pos);
                if (canAttack) {
                    this.creep.attack(target);
                }

                if (!hasMoved && canAttack) {
                    this.creep.move(defensiveDirection);
                    hasMoved = true;
                } else if (!hasMoved) {
                    this.creep.moveTo(target);
                    hasMoved = true;
                }
            }
        }

        if (!hasMoved) {
            this.creep.moveTo(this.getRally());
        }
    }
}

Guard.LEVEL_INFO = Object.freeze([
    {
        count: 1,
        parts: [Game.RANGED_ATTACK, Game.MOVE]
    },
    {
        count: 1,
        parts: [Game.TOUGH, Game.RANGED_ATTACK, Game.MOVE]
    },
    {
        count: 2,
        parts: [Game.TOUGH, Game.TOUGH, Game.RANGED_ATTACK, Game.MOVE]
    },
    {
        count: 3,
        parts: [Game.TOUGH, Game.TOUGH, Game.TOUGH, Game.TOUGH, Game.RANGED_ATTACK, Game.MOVE, Game.MOVE, Game.RANGED_ATTACK, Game.MOVE]
    }
]);

Guard.registerType(Guard.k(), Guard);

module.exports = Guard;
