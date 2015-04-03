'use strict';

let BaseRole = require('base-role'),
    _ = require('lodash');

class Runner extends BaseRole {
    static key() {
        return 'runner';
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

    findTarget() {
        let droppedEnergy = this.creep.pos.findClosest(Game.DROPPED_ENERGY, {
            filter: e => e.energy > 20 && e.pos.inRangeTo(this.creep.pos, 6)
        });
        if (droppedEnergy) {
            this.memory.targetId = droppedEnergy.id;
        } else {
            let harvesterId = _.max(this.memory.harvestersToCollect, id => {
                let harvester = Game.getObjectById(id);
                if (!harvester) {
                    console.log('Invalid harvester id <' + id + '> on creep ', this.creep.name);
                    return -1;
                }
                return harvester.energy;
            });
            if (harvesterId) {
                this.memory.targetId = harvesterId;
            }
        }
    }

    run() {
        if (!this.isViable()) {
            this.creep.suicide();
        } else if (this.creep.energy < this.creep.energyCapacity) {
            if (!this.memory.targetId) {
                this.findTarget();
            }
            let target = Game.getObjectById(this.memory.targetId);
            if (!target) {
                this.findTarget();
                target = Game.getObjectById(this.memory.targetId);
            }

            if (this.creep.pos.isNearTo(target)) {
                if (target.transferEnergy) {
                    target.transferEnergy(this.creep);
                } else {
                    this.creep.pickup(target);
                }
                this.memory.targetId = null;
            } else {
                this.creep.moveTo(target);
            }
        } else {
            this.creep.moveTo(this.spawn);
            this.creep.transferEnergy(this.spawn);
            this.memory.targetId = null;
        }
    }
}

module.exports = Runner;
