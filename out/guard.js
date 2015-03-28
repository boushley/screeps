"use strict";
module.exports = exports = function (creep) {
    var spawn = Game.spawns[creep.memory.spawnName];
    var target = creep.pos.findClosest(Game.HOSTILE_CREEPS, {
        filter: function (h) {
            return h.pos.inRangeTo(spawn.pos, 12);
        }
    });

    if (target) {
        if (creep.getActiveBodyparts(Game.RANGED_ATTACK) > 0) {
            var _ret = (function () {
                var damageCanDeal = 0;
                var inRangeEnemies = creep.pos.findInRange(Game.HOSTILE_CREEPS, 3);
                inRangeEnemies.forEach(function (e) {
                    var range = creep.pos.getRangeTo(e.pos);
                    if (range === 3) {
                        damageCanDeal += 1;
                    } else if (range === 2) {
                        damageCanDeal += 4;
                    } else if (range === 1) {
                        damageCanDeal += 10;
                    }
                });

                if (damageCanDeal >= 10) {
                    creep.rangedMassAttack();
                } else if (target.pos.inRangeTo(creep.pos, 3)) {
                    creep.rangedAttack(target);
                } else {
                    creep.moveTo(target);
                }

                return {
                    v: undefined
                };
            })();

            if (typeof _ret === "object") return _ret.v;
        } else if (creep.getActiveBodyparts(Game.ATTACK) > 0) {
            creep.moveTo(target);
            creep.attack(target);
            return;
        }
    }

    var rallyPoint = spawn.pos;
    if (Game.flags.BoushleyRally) {
        rallyPoint = Game.flags.BoushleyRally.pos;
    }

    var x = rallyPoint.x;
    var y = rallyPoint.y;

    if (creep.getActiveBodyparts(Game.ATTACK) > 0) {
        y += 1;
    } else {
        y -= 1;
    }

    creep.moveTo(x, y);
};