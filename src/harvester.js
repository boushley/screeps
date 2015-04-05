'use strict';

let BaseRole = require('base-role');

class Harvester extends BaseRole {
    static key() {
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
        let source = Game.getObjectById(this.memory.targetSourceId),
            enemies = source.pos.findInRange(Game.HOSTILE_CREEPS, 4);

        if (!this.isViable()) {
            this.creep.suicide();
        } else if (this.memory.fallbackLocation && enemies.length > 0) {
            let l = this.memory.fallbackLocation;
            this.creep.moveTo(l.x, l.y);
        } else if (this.creep.energy < this.creep.energyCapacity) {
            if (source && source.energy > 10) {
                this.creep.moveTo(source);
                this.creep.harvest(source);
            } else {
                console.log('Harvester source invalid!', JSON.stringify(this.memory));
            }
        } else {
            this.creep.moveTo(this.spawn);
            this.creep.transferEnergy(this.spawn);
        }
    }
}

module.exports = Harvester;
