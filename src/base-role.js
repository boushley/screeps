'use strict';
class BaseRole {
    constructor(creep) {
        this.creep = creep;
        this.spawn = Game.spawns[creep.memory.spawnName];
    }

    getRally() {
        let rallyPoint = this.spawn.pos;
        if (Game.flags.BoushleyRally) {
            rallyPoint = Game.flags.BoushleyRally.pos;
        }

        let result = {
            x: rallyPoint.x,
            y: rallyPoint.y
        };

        // On this map up is the back-side direction
        if (this.creep.getActiveBodyparts(Game.ATTACK) > 0) {
            result.y += 1;
        } else {
            result.y -= 1;
        }

        return result;
    }
}
