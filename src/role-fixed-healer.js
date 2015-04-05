'use strict';

let BaseRole = require('base-role');

class FixedHealer extends BaseRole {
    static key() {
        return 'fixed-healer';
    }

    run() {
        let l = this.memory.location,
            target = this.creep.pos.findClosest(Game.MY_CREEPS, {
                filter: c => c.hits < c.hitsMax
            });

        this.creep.moveTo(l.x, l.y);

        if (target) {
            if (this.creep.pos.isNearTo(target)) {
                this.creep.heal(target);
            }
            if (this.creep.pos.inRangeTo(target, 3)) {
                this.creep.rangedHeal(target);
            }
        }

    }
}

module.exports = FixedHealer;
