'use strict';

let BaseRole = require('base-role');

class Healer extends BaseRole {
    static key() {
        return 'healer';
    }

    run() {
        var target = this.creep.pos.findClosest(Game.MY_CREEPS, {
            filter: function(object) {
                return object.hits < object.hitsMax;
            }
        });

        // TODO Take advantage of the fact that we can heal AND
        // ranged heal AND move in the same turn.
        // Also have better standby logic, maybe something to
        // stay away from enemies.
        if (target) {
            if (this.creep.pos.isNearTo(target)) {
                this.creep.heal(target);
            } else if (this.creep.pos.inRangeTo(target, 3)) {
                this.creep.rangedHeal(target);
            } else {
                this.creep.moveTo(target);
            }
        } else {
            this.creep.moveTo(this.getRally());
        }
    }
}

module.exports = Healer;
