'use strict';

module.exports = function(lifespanObjectId) {
    if (Memory.memoryLifespanObjectId !== lifespanObjectId) {
        delete Memory.memoryLifespanObjectId;
        delete Memory.creeps;
        delete Memory.strategy;
        delete Memory.spawns;

        Memory.memoryLifespanObjectId = lifespanObjectId;
    }
};
