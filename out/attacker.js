"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var BaseRole = require("base-role");

var Attacker = (function (_BaseRole) {
    function Attacker() {
        _classCallCheck(this, Attacker);

        if (_BaseRole != null) {
            _BaseRole.apply(this, arguments);
        }
    }

    _inherits(Attacker, _BaseRole);

    _createClass(Attacker, {
        run: {
            value: function run() {
                var target = this.spawn.pos.findClosest(Game.HOSTILE_CREEPS, {
                    filter: function (c) {
                        var hasAttack = c.getActiveBodyparts(Game.ATTACK) === 0,
                            hasHeal = c.getActiveBodyparts(Game.HEAL) === 0,
                            hasRangedAttack = c.getActiveBodyparts(Game.RANGED_ATTACK) === 0;
                        return hasAttack || hasHeal || hasRangedAttack;
                    }
                });

                if (target) {
                    this.creep.moveTo(target);
                    this.creep.attack(target);
                }
            }
        }
    }, {
        key: {
            value: function key() {
                return "attacker";
            }
        }
    });

    return Attacker;
})(BaseRole);

module.exports = Attacker;