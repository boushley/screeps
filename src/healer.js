'use strict';

let BaseRole = require('base-role');

class Healer extends BaseRole {
    constructor() {
        super(...arguments);
    }

    static k() {
        return 'healer';
    }

    run() {
        var target = this.creep.pos.findClosest(Game.MY_CREEPS, {
            filter: function(object) {
                return object.hits < object.hitsMax;
            }
        });

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

Healer.LEVEL_INFO = Object.freeze([
    {
        count: 0,
        parts: [Game.MOVE, Game.HEAL]
    },
    {
        count: 1,
        parts: [Game.MOVE, Game.HEAL]
    },
    {
        count: 2,
        parts: [Game.MOVE, Game.HEAL]
    },
    {
        count: 2,
        parts: [Game.MOVE, Game.HEAL, Game.MOVE, Game.HEAL]
    }
]);

Healer.registerType(Healer.k(), Healer);

module.exports = Healer;
