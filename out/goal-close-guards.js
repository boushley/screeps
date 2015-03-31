"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var GoalBase = require("goal-base"),
    counts = require("counts"),
    Guard = require("guard"),
    Healer = require("healer");

var GoalCloseGuards = (function (_GoalBase) {
    function GoalCloseGuards() {
        _classCallCheck(this, GoalCloseGuards);

        if (_GoalBase != null) {
            _GoalBase.apply(this, arguments);
        }
    }

    _inherits(GoalCloseGuards, _GoalBase);

    _createClass(GoalCloseGuards, {
        getCreepToBuild: {
            value: function getCreepToBuild() {
                var parts = undefined,
                    role = undefined,
                    guardCount = counts[Guard.key()] || 0,
                    healerCount = counts[Healer.key()] || 0;

                if (guardCount < 1) {
                    role = Guard.key();
                    parts = [Game.RANGED_ATTACK, Game.MOVE];
                } else if (healerCount < 1) {
                    role = Healer.key();
                    parts = [Game.MOVE, Game.HEAL];
                } else if (guardCount < 2) {
                    role = Guard.key();
                    parts = [Game.RANGED_ATTACK, Game.MOVE];
                } else if (healerCount < 2) {
                    role = Healer.key();
                    parts = [Game.MOVE, Game.HEAL, Game.MOVE, Game.HEAL];
                } else {
                    role = Guard.key();
                    parts = [Game.TOUGH, Game.TOUGH, Game.RANGED_ATTACK, Game.MOVE];
                }

                return {
                    parts: parts,
                    memory: {
                        role: role
                    }
                };
            }
        }
    }, {
        key: {
            value: function key() {
                return "goal-close-guards";
            }
        },
        isComplete: {
            value: function isComplete() {
                return false;
            }
        }
    });

    return GoalCloseGuards;
})(GoalBase);

module.exports = GoalCloseGuards;