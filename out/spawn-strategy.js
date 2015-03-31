"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var SpawnStrategy = (function () {
    function SpawnStrategy(spawn) {
        _classCallCheck(this, SpawnStrategy);

        this.spawn = spawn;

        if (!Memory.strategy) {
            Memory.strategy = {};
        }
        this.memory = Memory.strategy;

        if (!this.memory.goalMemories) {
            this.memory.goalMemories = {};
        }

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = PROGRESSIVE_GOALS[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var GoalClass = _step.value;

                if (!GoalClass.isComplete()) {
                    var goalKey = GoalClass.key();
                    if (!this.memory.goalMemories[goalKey]) {
                        this.memory.goalMemories[goalKey] = {};
                    }
                    this.goal = new GoalClass(this.memory.goalMemories[goalKey], this.spawn);
                    break;
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator["return"]) {
                    _iterator["return"]();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    }

    _createClass(SpawnStrategy, {
        isSpawnReady: {
            value: function isSpawnReady(thresholdEnergy) {
                if (!this.spawn) {
                    return false;
                }
                if (this.spawn.spawning) {
                    return false;
                }

                thresholdEnergy = thresholdEnergy || 0;
                if (thresholdEnergy > this.spawn.energy) {
                    return false;
                }

                return true;
            }
        },
        createCreep: {
            value: function createCreep(parts, name, memory) {
                memory.spawnName = memory.spawnName || this.spawn.name;

                return this.spawn.createCreep(parts, name, memory);
            }
        },
        getCreepToBuild: {
            value: function getCreepToBuild() {
                return this.goal.getCreepToBuild();
            }
        }
    });

    return SpawnStrategy;
})();

module.exports = SpawnStrategy;

var PROGRESSIVE_GOALS = Object.freeze([require("goal-closest-harvest"), require("goal-close-guards")]);