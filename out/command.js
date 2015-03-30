"use strict";

var roleMapper = require("role-mapper");

exports.run = function () {
    for (var i in Game.creeps) {
        var creep = Game.creeps[i],
            Role = roleMapper.getType(creep.memory.role);

        if (Role) {
            var r = new Role();
            r.run();
        }
    }
};