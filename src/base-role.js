'use strict';

class BaseRole {
    constructor(creep) {
        this.creep = creep;
        this.spawn = Game.spawns[creep.memory.spawnName];
    }

    static getCount(level) {
        return this.LEVEL_INFO[level || 0].count;
    }

    static getParts(level) {
        return this.LEVEL_INFO[level || 0].parts;
    }

    getRally() {
        let rallyPoint = this.spawn.pos;
        if (Game.flags.BoushleyRally) {
            rallyPoint = Game.flags.BoushleyRally.pos;
        }

        let newCoords = {
            x: rallyPoint.x,
            y: rallyPoint.y
        };

        // On this map up is the back-side direction
        if (this.creep.getActiveBodyparts(Game.ATTACK) > 0) {
            newCoords.y += 1;
        } else {
            newCoords.y -= 1;
        }

        return this.creep.room.getPositionAt(newCoords.x, newCoords.y);
    }

    getDefensivePosition() {
        return this.creep.pos.findClosest(Game.MY_STRUCTURES, {
            filter: s => s.structureType === Game.STRUCTURE_RAMPART
        }).pos;
    }
}

module.exports = BaseRole;
