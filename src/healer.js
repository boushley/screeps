'use strict';

let BaseRole = require('base-role');

class Healer extends BaseRole {
    static key() {
        return 'healer';
    }

    run() {
        let target = this.creep.pos.findClosest(Game.MY_CREEPS, {
                filter: c => c.hits < c.hitsMax
            }),
            moveTarget = target || this.getRally();

        if (target) {
            if (this.creep.pos.isNearTo(target)) {
                this.creep.heal(target);
            }
            if (this.creep.pos.inRangeTo(target, 3)) {
                this.creep.rangedHeal(target);
            }
        }

        this.creep.moveTo(moveTarget);
    }
}

module.exports = Healer;
