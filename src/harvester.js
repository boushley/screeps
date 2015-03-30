'use strict';

let BaseRole = require('base-role');

class Harvester extends BaseRole {
    constructor() {
        super(...arguments);
    }

    static k() {
        return 'harvester';
    }

    isViable() {
        for (var i = 0; i < this.creep.body.length; i++) {
            var part = this.creep.body[i];
            if (part.hits < 1) {
                return false;
            }
        }

        return true;
    }

    run() {
        if (!this.isViable()) {
            this.creep.suicide();
        } else if (this.creep.energy < this.creep.energyCapacity) {
            if (!this.spawn.memory.targetSourceId) {
                var s = this.creep.pos.findClosest(Game.SOURCES, {
                    filter: function(source) {
                        return source.energy > 20;
                    }
                });
                if (s) {
                    this.spawn.memory.targetSourceId = s.id;
                }
            }

            if (this.spawn.memory.targetSourceId) {
                let source = Game.getObjectById(this.spawn.memory.targetSourceId);
                if (source && source.energy > 10) {
                    this.creep.moveTo(source);
                    this.creep.harvest(source);
                } else {
                    this.spawn.memory.targetSourceId = null;
                }
            }
        } else {
            this.creep.moveTo(this.spawn);
            this.creep.transferEnergy(this.spawn);
        }
    }
}

Harvester.LEVEL_INFO = Object.freeze([
    {
        count: 1,
        parts: [Game.WORK, Game.CARRY, Game.MOVE]
    },
    {
        count: 2,
        parts: [Game.WORK, Game.CARRY, Game.MOVE]
    },
    {
        count: 2,
        parts: [Game.WORK, Game.WORK, Game.CARRY, Game.CARRY, Game.MOVE, Game.MOVE]
    },
    {
        count: 2,
        parts: [Game.WORK, Game.WORK, Game.CARRY, Game.CARRY, Game.MOVE, Game.MOVE]
    }
]);

Harvester.registerType(Harvester.k(), Harvester);

module.exports = Harvester;
