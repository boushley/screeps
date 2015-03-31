'use strict';

let GoalBase = require('goal-base'),
    Harvester = require('harvester'),
    counts = require('counts');

class GoalClosestHarvest extends GoalBase {
    static key() {
        return 'goal-closest-harvest';
    }

    static isComplete() {
        let key = Harvester.key(),
            harvesterCount = counts[key];

        return harvesterCount >= 3;
    }

    getCreepToBuild() {
        var s = this.spawn.pos.findClosest(Game.SOURCES, {
            filter: function(source) {
                return source.energy > 20;
            }
        });

        return {
            parts: [Game.WORK, Game.CARRY, Game.MOVE],
            memory: {
                role: Harvester.key(),
                targetSourceId: s.id
            }
        };
    }
}

module.exports = GoalClosestHarvest;
