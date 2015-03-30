'use strict';

let BaseRole = require('base-role');

exports.run = function() {
    for (let i in Game.creeps) {
        let creep = Game.creeps[i],
            Role = BaseRole.getType(creep.memory.role);

        if (Role) {
            let r = new Role();
            r.run();
        }
    }
};
