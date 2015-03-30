"use strict";

var BaseRole = require("base-role");

exports.run = function () {
    for (var i in Game.creeps) {
        var creep = Game.creeps[i],
            Role = BaseRole.getType(creep.memory.role);

        if (Role) {
            var r = new Role();
            r.run();
        }
    }
};