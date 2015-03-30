'use strict';

let roleMapper = require('role-mapper');

exports.run = function() {
    for (let i in Game.creeps) {
        let creep = Game.creeps[i],
            Role = roleMapper.getType(creep.memory.role);

        if (Role) {
            let r = new Role();
            r.run();
        }
    }
};
