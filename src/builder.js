'use strict';

var Harvester = require('harvester');

class Builder extends Harvester {
    static key() {
        return 'builder';
    }

    handleTarget(target, isRepair) {
        if (this.creep.energy === 0) {
            this.creep.moveTo(this.spawn);
            if (this.spawn.energy > 200) {
                this.spawn.transferEnergy(this.creep);
            }
        } else {
            this.creep.moveTo(target);
            if (isRepair) {
                this.creep.repair(target);
            } else {
                this.creep.build(target);
            }
        }
    }

    run() {
        if (this.spawn.energy < 200) {
            super.run();
        } else {
            var buildTarget = this.spawn.pos.findClosest(Game.CONSTRUCTION_SITES, {
                filter: s => s.my
            });
            var repairTarget = this.spawn.pos.findClosest(Game.MY_STRUCTURES, {
                filter: s => s.hits < (s.hitsMax - 20)
            });

            if (buildTarget) {
                this.handleTarget(buildTarget, false);
            } else if (repairTarget) {
                this.handleTarget(repairTarget, true);
            } else {
                super.run();
            }
        }
    }
}

module.exports = Builder;
