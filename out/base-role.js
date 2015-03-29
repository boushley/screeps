"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var BaseRole = (function () {
    function BaseRole(creep) {
        _classCallCheck(this, BaseRole);

        this.creep = creep;
        this.spawn = Game.spawns[creep.memory.spawnName];
    }

    _createClass(BaseRole, {
        getRally: {
            value: function getRally() {
                var rallyPoint = this.spawn.pos;
                if (Game.flags.BoushleyRally) {
                    rallyPoint = Game.flags.BoushleyRally.pos;
                }

                var result = {
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
    });

    return BaseRole;
})();

module.exports = BaseRole;