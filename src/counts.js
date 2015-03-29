'use strict';

function getCounts() {
    let counts = {};

    for(let i in Game.creeps) {
        let creep = Game.creeps[i];
        if (!creep.my) {
            continue;
        }

        let role = creep.memory.role;

        if (counts[role] === undefined) {
            counts[role] = 1;
        } else {
            counts[role] += 1;
        }
    }

    return counts;
}

module.exports = getCounts();
