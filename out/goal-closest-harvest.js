"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var GoalBase = require("goal-base"),
    Harvester = require("harvester"),
    counts = require("counts");

var GoalClosestHarvest = (function (_GoalBase) {
    function GoalClosestHarvest() {
        _classCallCheck(this, GoalClosestHarvest);

        if (_GoalBase != null) {
            _GoalBase.apply(this, arguments);
        }
    }

    _inherits(GoalClosestHarvest, _GoalBase);

    _createClass(GoalClosestHarvest, {
        getCreepToBuild: {
            value: function getCreepToBuild() {
                var s = this.spawn.pos.findClosest(Game.SOURCES, {
                    filter: function filter(source) {
                        return source.energy > 20;
                    }
                });

                return {
                    parts: [Game.WORK, Game.CARRY, Game.MOVE],
                    memory: {
                        role: Harvester.key(),
                        targetSourceId: s.id
                    }
                };
            }
        }
    }, {
        key: {
            value: function key() {
                return "goal-closest-harvest";
            }
        },
        isComplete: {
            value: function isComplete() {
                var key = Harvester.key(),
                    harvesterCount = counts[key];

                return harvesterCount < 3;
            }
        }
    });

    return GoalClosestHarvest;
})(GoalBase);

module.exports = GoalClosestHarvest;