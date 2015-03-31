"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var BaseRole = require("base-role");

var Healer = (function (_BaseRole) {
    function Healer() {
        _classCallCheck(this, Healer);

        if (_BaseRole != null) {
            _BaseRole.apply(this, arguments);
        }
    }

    _inherits(Healer, _BaseRole);

    _createClass(Healer, {
        run: {
            value: function run() {
                var target = this.creep.pos.findClosest(Game.MY_CREEPS, {
                    filter: function filter(object) {
                        return object.hits < object.hitsMax;
                    }
                });

                // TODO Take advantage of the fact that we can heal AND
                // ranged heal AND move in the same turn.
                // Also have better standby logic, maybe something to
                // stay away from enemies.
                if (target) {
                    if (this.creep.pos.isNearTo(target)) {
                        this.creep.heal(target);
                    } else if (this.creep.pos.inRangeTo(target, 3)) {
                        this.creep.rangedHeal(target);
                    } else {
                        this.creep.moveTo(target);
                    }
                } else {
                    this.creep.moveTo(this.getRally());
                }
            }
        }
    }, {
        key: {
            value: function key() {
                return "healer";
            }
        }
    });

    return Healer;
})(BaseRole);

module.exports = Healer;