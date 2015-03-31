"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var GoalBase = require("goal-base"),
    Harvester = require("harvester"),
    counts = require("counts");

var GoalClosestHarvest = (function (_GoalBase) {
    function GoalClosestHarvest() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        _classCallCheck(this, GoalClosestHarvest);

        _get(Object.getPrototypeOf(GoalClosestHarvest.prototype), "constructor", this).apply(this, args);

        if (!this.memory.targetSourceId) {
            var s = this.spawn.pos.findClosest(Game.SOURCES, {
                filter: function filter(source) {
                    return source.energy > 20;
                }
            });
            this.memory.targetSourceId = s.id;
        }
    }

    _inherits(GoalClosestHarvest, _GoalBase);

    _createClass(GoalClosestHarvest, {
        getCreepToBuild: {
            value: function getCreepToBuild() {
                return {
                    parts: [Game.WORK, Game.CARRY, Game.MOVE],
                    memory: {
                        role: Harvester.key(),
                        targetSourceId: this.memory.targetSourceId
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

                return harvesterCount >= 3;
            }
        }
    });

    return GoalClosestHarvest;
})(GoalBase);

module.exports = GoalClosestHarvest;